import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";

// Force dynamic rendering to avoid static generation issues
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  let shouldRedirect = false;
  
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token");
    shouldRedirect = !!token;
  } catch {
    // If cookies() fails during build, continue without redirect
  }

  if (shouldRedirect) {
    redirect("/");
  }

  return <LoginForm />;
}