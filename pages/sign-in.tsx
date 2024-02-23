import { SignIn } from "@clerk/nextjs";


export default function SignInPage() {
  return (
    <div>
      <div className="flex justify-center py-24">
        <SignIn />
      </div>
    </div>
  );
}
