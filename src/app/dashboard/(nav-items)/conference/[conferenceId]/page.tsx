import { Button } from '@/components/ui/button';
import Link from 'next/link';
import React from 'react'

function Conference() {
  return (
      <div className='flex justify-center'>
        <Link href='/dashboard/conference/new-submission'>
              <Button className='cursor-pointer' >Make a new submission</Button>
        </Link>
    </div>
  )
}

export default Conference;