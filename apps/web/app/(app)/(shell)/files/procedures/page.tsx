import ProceduresClient from './ProceduresClient';

export const dynamic = 'force-dynamic';


export const metadata = { 
 title: 'Files · Procedures',
 description: 'Standard operating procedures and workflows'
};

export default function ProceduresPage() {
 return <ProceduresClient />;
}
