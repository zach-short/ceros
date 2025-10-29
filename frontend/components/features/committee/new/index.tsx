'use client'

import { Input } from "@/components/ui/input"
import { Label } from "@radix-ui/react-label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { AddMemberInput } from "./add-member-input"
import { Button } from "@/components/ui/button"
import { AddObserverInput } from "./add-observer-input"
import { useCallback, useEffect, useState } from "react"
import { User } from '@/lib/api/friends';
import { sl } from "date-fns/locale"
import { MemberSheet } from "./member-sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { stringify } from "querystring"



export default function NewCommittee() {
  const [selectedMembers, setSelectedMembers] = useState<User[]>([]);
  const [chair, setChair] = useState<User[]>([]);

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
          <label className="block text-sm font-medium mb-1">Committee Description</label>
          <Textarea className="w-full h-50" placeholder="Please enter your committee description here..."/>
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
            <Select>
            <SelectTrigger className="w-[240px]">
            <SelectValue placeholder="Select a Member" />
            </SelectTrigger>
            <SelectContent>
              {
                selectedMembers.length > 0 ? selectedMembers.map(
                  (member) => (
                  <SelectItem key={member.id.toString()} value={member.id.toString()}> 
                    {
                      member.name?.substring(0, member.name.length)
                    }
                  </SelectItem>)
                ) : 
                <div className="text-muted-foreground px-2 py-1 text-sm italic">
                  No members found
                </div>
              }
            </SelectContent>
            </Select>
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
