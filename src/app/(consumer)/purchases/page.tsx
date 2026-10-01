import { auth } from "@clerk/nextjs/server"

export default async function Purchases() {
  await auth.protect()

  return <div>Purchases</div>
}
