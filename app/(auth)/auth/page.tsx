import SignIn from "@/components/login/sign-in";

export default async function Home() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <SignIn />
      </div>
    </div>
  );
}
