import {SignUp } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className='h-screen flex items-center justify-center mt-[-18px] bg-gray-50'>
      <div className='w-full max-w-md'>
        <SignUp />
      </div>
    </div>
  )
}