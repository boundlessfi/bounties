import SignIn from "@/components/login/sign-in";
import Image from "next/image";



/**
 * Render a full-screen, centered container that displays the SignIn component.
 *
 * @returns A JSX element containing a full-height centered wrapper with the `SignIn` component.
 */
export default async function Home() {
  return (
    <div className="flex justify-center items-center h-screen">
      <SignIn />
    </div>
    
    
  );
}