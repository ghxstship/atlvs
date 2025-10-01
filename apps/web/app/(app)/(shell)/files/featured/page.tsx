import FeaturedClient from './FeaturedClient';

export const dynamic = 'force-dynamic';


export const metadata = { 
 title: 'Resources · Featured',
 description: 'Showcase your most important organizational resources'
};

export default function ResourcesFeaturedPage() {
 return <FeaturedClient />;
}
