import { auth } from "@clerk/nextjs/server"

export default async function Courses() {
  await auth.protect()

  return (
    <div>
      Courses
    </div>
  )
}