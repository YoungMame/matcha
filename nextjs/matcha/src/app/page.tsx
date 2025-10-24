import Link from "next/link";

export default function Home() {
	return (
		<div className="font-sans min-h-screen bg-gray-50 dark:bg-gray-900">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<div className="text-center">
					<h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
						Welcome to Matcha
					</h1>
					<p className="mt-4 max-w-xl mx-auto text-xl text-gray-500 dark:text-gray-400">
						A Next.js authentication demo with JWT and protected routes
					</p>

					<div className="mt-10 flex justify-center gap-4">
						<Link
							href="/login"
							className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
						>
							Login
						</Link>
						<Link
							href="/dashboard"
							className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-700 text-base font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
						>
							Dashboard (Protected)
						</Link>
					</div>

					<div className="mt-16 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
						<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
							Demo Credentials
						</h2>
						<div className="space-y-2 text-left max-w-md mx-auto">
							<div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
								<span className="font-medium text-gray-700 dark:text-gray-300">Username:</span>
								<code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded text-sm">admin</code>
							</div>
							<div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
								<span className="font-medium text-gray-700 dark:text-gray-300">Password:</span>
								<code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded text-sm">admin123</code>
							</div>
							<p className="text-center text-sm text-gray-500 dark:text-gray-400 pt-2">
								or use <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">user</code> / <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">user123</code>
							</p>
						</div>
					</div>

					<div className="mt-12 text-left max-w-3xl mx-auto">
						<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
							Features:
						</h3>
						<ul className="space-y-2 text-gray-600 dark:text-gray-400">
							<li className="flex items-start">
								<svg className="h-6 w-6 text-green-500 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
									<path d="M5 13l4 4L19 7"></path>
								</svg>
								JWT-based authentication with HTTP-only cookies
							</li>
							<li className="flex items-start">
								<svg className="h-6 w-6 text-green-500 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
									<path d="M5 13l4 4L19 7"></path>
								</svg>
								Next.js middleware for route protection
							</li>
							<li className="flex items-start">
								<svg className="h-6 w-6 text-green-500 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
									<path d="M5 13l4 4L19 7"></path>
								</svg>
								React Query for data fetching and caching
							</li>
							<li className="flex items-start">
								<svg className="h-6 w-6 text-green-500 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
									<path d="M5 13l4 4L19 7"></path>
								</svg>
								Mock API endpoints for authentication
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
}
