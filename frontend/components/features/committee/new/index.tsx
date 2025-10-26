'use client'

import { Input } from "@/components/ui/input"
import { Label } from "@radix-ui/react-label"
import { Checkbox } from "@/components/ui/checkbox"
import { AddMemberInput } from "./add-member-input"
import { Button } from "@/components/ui/button"
import { AddObserverInput } from "./add-observer-input"
import { useCallback, useEffect, useState } from "react"
import { User } from '@/lib/api/friends';
import { sl } from "date-fns/locale"
import { MemberSheet } from "./member-sheet"


export default function NewCommittee() {
  const [selectedMembers, setSelectedMembers] = useState<User[]>([]);
  const [chair, setChair] = useState<User[]>([]);

  useEffect(() => {
    console.log(selectedMembers);
  }, [selectedMembers]);

  const isChecked = useCallback((member: User) => { 
    const memberIds = selectedMembers.map((m) => m.id);
    return memberIds.includes(member.id);
  }, [selectedMembers])

  const handleToggle = (clickedMember: User) => {
    const selectedMemberIds = selectedMembers.map(member => member.id);

    const isIncluded = selectedMemberIds.includes(clickedMember.id);
    if (isIncluded) {
      setSelectedMembers(selectedMembers.filter((member) => member.id !== clickedMember.id));
    } else {
      setSelectedMembers([...selectedMembers, clickedMember]);
    }
  }

  const handleSave = (membersBuffer: User[]) => {
    if (membersBuffer.length === 0) {
      return;
    }
    
    setSelectedMembers(selectedMembers.filter((member) => !membersBuffer.includes(member)))
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <form className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">Enter Committee Name</label>
          <Input className="w-full" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Enter Members</label>
          <div>
          <AddMemberInput 
          onToggle={handleToggle}
          isChecked={isChecked}
          />
          <MemberSheet
          selectedMembers={selectedMembers}
          onSave={handleSave}
          />
          </div>
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
