'use client'

import { Input } from "@/components/ui/input"
import { Label } from "@radix-ui/react-label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { AddMemberInput } from "./add-member-input"
import { Button } from "@/components/ui/button"
import { useCallback, useState } from "react"
import { User } from '@/lib/api/friends';
import { MemberSheet } from "./member-sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { stringify } from "querystring"
import { useFriends } from '@/hooks/api/use-friends';




export default function NewCommittee() {
  const [selectedMembers, setSelectedMembers] = useState<User[]>([]);
  const [chair, setChair] = useState<string | null>(null);
  
  // Load all friendships once
  const { data, error, loading } = useFriends();
  const friendships = data?.friendships ?? [];
  const users = friendships.flatMap((friendship) =>  
    friendship.user ? [friendship.user] : [])


  const onChairChange = ((chairName: string|null) => {
    setChair(chairName);
  })

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
          <label className="block text-sm font-medium mb-1">Committee Name</label>
          <Input className="w-full" placeholder="Please enter you committee name..."/>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Committee Description</label>
          <Textarea className="w-full h-50" placeholder="Please enter your committee description here..."/>
        </div>

        {/* Put two fields side-by-side on larger screens */}
        
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-1">Enter Members</label>
            <div>
            <AddMemberInput
            users={users}
            loading={loading}
            onToggle={handleToggle}
            isChecked={isChecked}
            />
            <MemberSheet
            selectedMembers={selectedMembers}
            onSave={handleSave}
            />
          </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Assign Chair</label>
            <Select onValueChange={onChairChange}>
            <SelectTrigger className="w-[240px] font-medium">
            <SelectValue placeholder="Select a Member"/>
            </SelectTrigger>
            <SelectContent className="font-medium">
              {
                selectedMembers.length > 0 ? selectedMembers.map(
                  (member) => (
                  <SelectItem key={member.id.toString()} value={member.name ?? ""}
                    className="font-medium"> 
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
