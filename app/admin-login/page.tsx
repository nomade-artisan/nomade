import AdminLoginForm from "@/components/admin/layout/AdminLoginForm";

type AdminLoginPageProps = {
  searchParams?: Promise<{
    next?: string | string[];
  }>;
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const nextParam = resolvedSearchParams?.next;
  const nextPath = Array.isArray(nextParam)
    ? nextParam[0] || "/admin"
    : nextParam || "/admin";

  return <AdminLoginForm nextPath={nextPath} />;
}
