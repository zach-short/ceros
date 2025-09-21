'use client'

import { Input } from "@/components/ui/input"
import { Label } from "@radix-ui/react-label"
import { Checkbox } from "@/components/ui/checkbox"
import { AddMemberInput } from "./add-member-input"
import { Button } from "@/components/ui/button"
import { AddObserverInput } from "./add-observer-input"


export default function NewCommittee() {
  return (
    <div className="mx-auto max-w-2xl p-6">
      <form className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">Enter Committee Name</label>
          <Input className="w-full" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Enter Members</label>
          <AddMemberInput/>
        </div>

        {/* Put two fields side-by-side on larger screens */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-1">Assign Chair</label>
            <Input className="w-full" />          
        </div>

        <div>
            <label className="block text-sm font-medium mb-1">Enter Observers</label>
            <AddObserverInput/>
          </div>
        </div>

        <label
          htmlFor="IsTemporaryCommittee"
          className="flex items-center gap-3"
        >
          {/* If using shadcn Checkbox, you usually don't style via bg-*; leave as is or use data-state styles */}
          <Checkbox id="IsTemporaryCommittee" />
          <span>Is this committee temporary?</span>
        </label>

        <div className="flex justify-end pt-2">
          <Button>Save</Button>
        </div>
      </form>
    </div>
  );
}
