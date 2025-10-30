import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { User } from '@/lib/api/friends'
import { Checkbox } from "@/components/ui/checkbox"
import { useEffect, useState } from "react"
import { on } from "events"


export function MemberSheet({
    selectedMembers,
    onSave
}: {
    selectedMembers: User[]
    onSave: (members: User[]) => void
}
) {
  const [membersBuffer, setMembersBuffer] = useState<User[]>([...selectedMembers]);
  
  const handleToggle = (member : User) => {
    const Ids = membersBuffer.map(member => member.id);

    const isIncluded = Ids.includes(member.id);
    if (isIncluded) {
      setMembersBuffer(membersBuffer.filter((listMember) => listMember.id !== member.id));
    } else {
      setMembersBuffer([...membersBuffer, member]);
    }
  }
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Selected Members</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Current Selected Members</SheetTitle>
          <SheetDescription>
            Make changes to your selected committee members here.
          </SheetDescription>
        </SheetHeader>
      {selectedMembers.length === 0 && <p className="px-4">No member is selected</p>}
      <div className="min-h-60 flex flex-col items-start mt-1">
        {selectedMembers.map((user) => (
          <div
            key={user.id}
            className="flex w-full items-center justify-between p-1 px-4 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <div>
              <p className="font-medium">
                {user.name || 'Unnamed User'}
                {'isCurrentUser' in user && (user as any).isCurrentUser && ' (You)'}
              </p>
              {(user.givenName || user.familyName) && (
                <p className="text-sm text-gray-500">
                  {user.givenName && user.familyName
                    ? `${user.givenName} ${user.familyName}`
                    : user.givenName || user.familyName}
                </p>
              )}
              {user.email && (
                <p className="text-xs text-gray-400">{user.email}</p>
              )}
            </div>
            <div>
              <Checkbox 
              defaultChecked 
              className='h-4 w-4 border border-gray-300'
              onCheckedChange={() => {
                handleToggle(user);
              }}
              />
            </div>
          </div>
        ))}
      </div>
        <SheetFooter>
          <SaveButton
          onSave={onSave}
          membersBuffer={membersBuffer}
          />
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function SaveButton({
  onSave,
  membersBuffer,
}:{
  onSave : (member: User[]) => void
  membersBuffer: User[]
}) {
  return <Button type="submit" 
          onClick={() => {
            onSave(membersBuffer);
          }}>
          Save Changes</Button>
}
