Run the development server:

npm run dev
or
npx next dev

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

For auth : JWT

"@tanstack/react-query": "^5.32.1",
"jwt-decode": "^4.0.0", ???

Axios is a popular HTTP client library for JavaScript that simplifies making HTTP requests from both browsers and Node.js environments.

TanStack is a family of libraries, with TanStack Query being the most popular. It's a powerful data-fetching and state management library.

// Axios makes the request
const fetchUser = (id) => axios.get(`/api/users/${id}`).then(res => res.data);

// TanStack Query manages caching, refetching, and state
const { data: user } = useQuery({
queryKey: ['user', id],
queryFn: () => fetchUser(id),
staleTime: 5 *60* 1000, // Cache for 5 minutes
});

For Geolocation =>
better handle special cases :
when chrome has not been allowed to access location,

manage error : User has not allowed access to system location
