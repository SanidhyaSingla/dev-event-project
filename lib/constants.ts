export type Event = {
  title: string;
  image: string;
  slug: string;
  location: string;
  date: string;
  time: string;
};

export const events: Event[] = [
  {
    title: "Devoxx Belgium 2026",
    image: "/images/event1.png",
    slug: "devoxx-belgium-2026",
    location: "Antwerp, Belgium",
    date: "October 5-9, 2026",
    time: "9:00 AM CET",
  },
  {
    title: "GitHub Universe 2026",
    image: "/images/event2.png",
    slug: "github-universe-2026",
    location: "San Francisco, CA",
    date: "October 28-29, 2026",
    time: "9:00 AM PT",
  },
  {
    title: "KubeCon + CloudNativeCon North America 2026",
    image: "/images/event3.png",
    slug: "kubecon-cloudnativecon-north-america-2026",
    location: "Salt Lake City, UT",
    date: "November 9-12, 2026",
    time: "9:00 AM MT",
  },
  {
    title: "Web Summit 2026",
    image: "/images/event4.png",
    slug: "web-summit-2026",
    location: "Lisbon, Portugal",
    date: "November 9-12, 2026",
    time: "10:00 AM WET",
  },
  {
    title: "React Summit US 2026",
    image: "/images/event5.png",
    slug: "react-summit-us-2026",
    location: "New York, NY",
    date: "November 17 and 20, 2026",
    time: "9:00 AM ET",
  },
  {
    title: "AWS re:Invent 2026",
    image: "/images/event6.png",
    slug: "aws-reinvent-2026",
    location: "Las Vegas, NV",
    date: "November 30-December 4, 2026",
    time: "8:00 AM PT",
  },
];
