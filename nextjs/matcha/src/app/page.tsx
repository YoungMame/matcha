"use client";

import Link from "next/link";
import { useState } from "react";
import SignInModal from "@/components/ui/homepage/SignInModal";
import Button from "@/components/common/Button";
import Typography from "@/components/common/Typography";
import Stack from "@/components/common/Stack";

export default function Home() {
	const [isModalOpen, setIsModalOpen] = useState(false);
	return (
		<div className="font-sans min-h-screen bg-gray-50 dark:bg-gray-900">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<Stack spacing="2xl" align="center">
					<Stack spacing="md" align="center">
						<Typography variant="h1" align="center">
							Welcome to Matcha
						</Typography>
						<Typography variant="body" color="secondary" align="center" className="max-w-xl text-xl">
							A Next.js authentication demo with JWT and protected routes
						</Typography>
					</Stack>

					<Stack direction="row" spacing="md" justify="center" wrap>
						<Button
							onClick={() => setIsModalOpen(true)}
							variant="outline"
						>
							S'inscrire
						</Button>
						<Link href="/login">
							<Button variant="primary">
								Login
							</Button>
						</Link>
						<Link href="/dashboard">
							<Button variant="secondary">
								Dashboard (Protected)
							</Button>
						</Link>
					</Stack>

					<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 w-full max-w-2xl">
						<Typography variant="h2" align="center" className="mb-4">
							Demo Credentials
						</Typography>
						<Stack spacing="sm" className="max-w-md mx-auto">
							<Stack direction="row" justify="between" align="center" className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
								<Typography color="primary" className="font-medium">Username:</Typography>
								<code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded text-sm">admin</code>
							</Stack>
							<Stack direction="row" justify="between" align="center" className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
								<Typography color="primary" className="font-medium">Password:</Typography>
								<code className="bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded text-sm">admin123</code>
							</Stack>
							<Typography variant="small" color="secondary" align="center" className="pt-2">
								or use <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">user</code> / <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">user123</code>
							</Typography>
						</Stack>
					</div>

					<Stack spacing="md" className="max-w-3xl w-full">
						<Typography variant="h3">
							Features:
						</Typography>
						<Stack spacing="sm" as="ul">
							<Stack direction="row" spacing="sm" align="start" as="li">
								<svg className="h-6 w-6 text-green-500 shrink-0" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
									<path d="M5 13l4 4L19 7"></path>
								</svg>
								<Typography color="secondary">
									JWT-based authentication with HTTP-only cookies
								</Typography>
							</Stack>
							<Stack direction="row" spacing="sm" align="start" as="li">
								<svg className="h-6 w-6 text-green-500 shrink-0" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
									<path d="M5 13l4 4L19 7"></path>
								</svg>
								<Typography color="secondary">
									Next.js middleware for route protection
								</Typography>
							</Stack>
							<Stack direction="row" spacing="sm" align="start" as="li">
								<svg className="h-6 w-6 text-green-500 shrink-0" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
									<path d="M5 13l4 4L19 7"></path>
								</svg>
								<Typography color="secondary">
									React Query for data fetching and caching
								</Typography>
							</Stack>
							<Stack direction="row" spacing="sm" align="start" as="li">
								<svg className="h-6 w-6 text-green-500 shrink-0" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
									<path d="M5 13l4 4L19 7"></path>
								</svg>
								<Typography color="secondary">
									Mock API endpoints for authentication
								</Typography>
							</Stack>
						</Stack>
					</Stack>
				</Stack>
			</div>

			<SignInModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
		</div>
	);
}
