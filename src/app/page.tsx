import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";

import AdminDashboard from "@/components/Dashboards/AdminDashboard";
import UserDashboard from "@/components/Dashboards/UserDashboard";

// Force dynamic rendering to avoid static generation issues
export const dynamic = "force-dynamic";

export default async function HomePage() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) redirect("/login");

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "sua_chave_secreta",
    ) as { id: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        company: {
          include: {
            subCompanies: true,
          },
        },
      },
    });

    if (!user || !user.isActive) {
      redirect("/login");
    }

    if (user.role === "ADMIN") {
      return <AdminDashboard user={user} />;
    }

    if (user.role === "USER") {
      if (!user.company) {
        return (
          <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
            <div className="bg-zinc-900 p-8 rounded-xl border border-zinc-800 text-center max-w-md">
              <h2 className="text-xl font-bold text-white mb-2">
                Acesso Pendente
              </h2>
              <p className="text-zinc-400">
                Sua conta ainda não foi vinculada a uma Empresa Matriz.
              </p>
            </div>
          </div>
        );
      }

      return (
        <UserDashboard
          user={user}
          company={user.company}
          subCompanies={user.company.subCompanies}
        />
      );
    }

    return null;
  } catch {
    redirect("/login");
  }
}
