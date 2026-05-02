import { getAdminAuth } from "@/lib/firebase-admin";

function isUserNotFound(e: unknown): boolean {
  return (
    typeof e === "object" &&
    e !== null &&
    "code" in e &&
    (e as { code: string }).code === "auth/user-not-found"
  );
}

export async function getOrCreateAuthUserByEmail(email: string): Promise<string> {
  const auth = getAdminAuth();
  try {
    const u = await auth.getUserByEmail(email);
    return u.uid;
  } catch (e: unknown) {
    if (!isUserNotFound(e)) throw e;
    const created = await auth.createUser({
      email: email.trim(),
      emailVerified: false,
    });
    return created.uid;
  }
}
