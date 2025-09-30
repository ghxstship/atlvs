"use client";

import OverviewTemplate from "../../dashboard/components/OverviewTemplate";
import { getModuleConfig } from "../../dashboard/lib/module-configs";

interface PeopleOverviewClientProps {
 orgId: string;
 userId: string;
 userEmail: string;
}

export default function PeopleOverviewClient({ orgId, userId, userEmail }: PeopleOverviewClientProps) {
 const config = getModuleConfig("people");

 return (
 <OverviewTemplate
 orgId={orgId}
 userId={userId}
 userEmail={userEmail}
 module="people"
 config={config}
 />
 );
}
