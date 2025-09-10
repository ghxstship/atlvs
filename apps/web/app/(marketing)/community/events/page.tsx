import { Metadata } from 'next';
import { Anton } from 'next/font/google';
import { Button } from '@ghxstship/ui';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-title' });

export const metadata: Metadata = {
  title: 'Community Events | GHXSTSHIP',
  description: 'Join GHXSTSHIP community events, workshops, and meetups to connect with fellow creators.',
};

export default function EventsPage() {
  const upcomingEvents = [
    {
      title: 'ATLVS Masterclass: Advanced Workflows',
      date: '2024-02-15',
      time: '2:00 PM PST',
      location: 'Virtual Event',
      attendees: 156,
      type: 'Workshop',
    },
    {
      title: 'GHXSTSHIP User Meetup - Los Angeles',
      date: '2024-02-22',
      time: '6:00 PM PST',
      location: 'Los Angeles, CA',
      attendees: 45,
      type: 'Meetup',
    },
    {
      title: 'OPENDECK Product Demo & Q&A',
      date: '2024-03-01',
      time: '11:00 AM PST',
      location: 'Virtual Event',
      attendees: 89,
      type: 'Demo',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className={`${anton.className} uppercase text-4xl md:text-5xl font-bold mb-6`}>
            COMMUNITY EVENTS
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Join our community events to learn, network, and connect with fellow creators and industry professionals.
          </p>
          <Button>
            View All Events
          </Button>
        </div>

        <div className="mb-16">
          <h2 className={`${anton.className} uppercase text-2xl font-bold mb-8`}>
            UPCOMING EVENTS
          </h2>
          <div className="space-y-6">
            {upcomingEvents.map((event, index) => (
              <div key={index} className="bg-card rounded-lg p-6 border hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium">
                        {event.type}
                      </span>
                    </div>
                    <h3 className={`${anton.className} uppercase text-xl font-bold mb-2`}>
                      {event.title}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {event.time}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {event.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {event.attendees} attending
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <Button variant="outline">
                      Register
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-muted/30 rounded-lg p-8">
            <h2 className={`${anton.className} uppercase text-2xl font-bold mb-4`}>
              HOST AN EVENT
            </h2>
            <p className="text-muted-foreground mb-6">
              Want to organize a GHXSTSHIP community event in your area? We'd love to help you connect with local creators.
            </p>
            <Button variant="outline">
              Submit Event Proposal
            </Button>
          </div>
          
          <div className="bg-muted/30 rounded-lg p-8">
            <h2 className={`${anton.className} uppercase text-2xl font-bold mb-4`}>
              PAST EVENTS
            </h2>
            <p className="text-muted-foreground mb-6">
              Missed an event? Check out recordings and resources from our previous workshops and meetups.
            </p>
            <Button variant="outline">
              View Archive
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
