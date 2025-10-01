import MediaClient from './MediaClient';

export const dynamic = 'force-dynamic';


export const metadata = { 
 title: 'Files · Media',
 description: 'Manage multimedia assets and content'
};

export default function MediaPage() {
 return <MediaClient />;
}
