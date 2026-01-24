import SignIn from "@/components/login/sign-in";
import Image from "next/image";



export default async function Home() {
  return (
    <div className="flex justify-center items-center h-screen">
      <SignIn />
    </div>
    
    
  );
}
