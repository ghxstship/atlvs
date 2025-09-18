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
    <div className="container mx-auto px-md py-3xl">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-3xl">
          <h1 className={`${anton.className} uppercase text-heading-1 md:text-display text-heading-3 mb-lg`}>
            COMMUNITY EVENTS
          </h1>
          <p className="text-heading-4 color-muted max-w-3xl mx-auto mb-xl">
            Join our community events to learn, network, and connect with fellow creators and industry professionals.
          </p>
          <Button>
            View All Events
          </Button>
        </div>

        <div className="mb-3xl">
          <h2 className={`${anton.className} uppercase text-heading-3 text-heading-3 mb-xl`}>
            UPCOMING EVENTS
          </h2>
          <div className="stack-lg">
            {upcomingEvents.map((event, index) => (
              <div key={index} className="bg-card rounded-lg p-lg border hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-sm mb-sm">
                      <span className="bg-primary/10 color-primary px-sm py-xs rounded text-body-sm form-label">
                        {event.type}
                      </span>
                    </div>
                    <h3 className={`${anton.className} uppercase text-heading-4 text-heading-3 mb-sm`}>
                      {event.title}
                    </h3>
                    <div className="flex flex-wrap gap-md text-body-sm color-muted">
                      <div className="flex items-center gap-xs">
                        <Calendar className="h-4 w-4" />
                        {new Date(event.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-xs">
                        <Clock className="h-4 w-4" />
                        {event.time}
                      </div>
                      <div className="flex items-center gap-xs">
                        <MapPin className="h-4 w-4" />
                        {event.location}
                      </div>
                      <div className="flex items-center gap-xs">
                        <Users className="h-4 w-4" />
                        {event.attendees} attending
                      </div>
                    </div>
                  </div>
                  <div className="mt-md md:mt-0">
                    <Button variant="outline">
                      Register
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-xl">
          <div className="bg-secondary/30 rounded-lg p-xl">
            <h2 className={`${anton.className} uppercase text-heading-3 text-heading-3 mb-md`}>
              HOST AN EVENT
            </h2>
            <p className="color-muted mb-lg">
              Want to organize a GHXSTSHIP community event in your area? We'd love to help you connect with local creators.
            </p>
            <Button variant="outline">
              Submit Event Proposal
            </Button>
          </div>
          
          <div className="bg-secondary/30 rounded-lg p-xl">
            <h2 className={`${anton.className} uppercase text-heading-3 text-heading-3 mb-md`}>
              PAST EVENTS
            </h2>
            <p className="color-muted mb-lg">
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
