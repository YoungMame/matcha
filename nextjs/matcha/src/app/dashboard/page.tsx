'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Button from '@/components/common/Button';
import Typography from '@/components/common/Typography';

interface User {
	id: string;
	username: string;
}

export default function DashboardPage() {
	const router = useRouter();

	// Fetch current user data
	const { data, isLoading, error } = useQuery<{ user: User }>({
		queryKey: ['user'],
		queryFn: async () => {
			const response = await axios.get('/api/auth/me');
			return response.data;
		},
		retry: false,
	});

	const handleLogout = async () => {
		try {
			await axios.post('/api/auth/logout');
			router.push('/login');
			router.refresh();
		} catch (error) {
			console.error('Logout failed:', error);
		}
	};

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
					<Typography color="secondary" className="mt-4">
						Loading...
					</Typography>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
				<div className="text-center">
					<Typography variant="h2" color="error">
						Authentication Error
					</Typography>
					<Typography color="secondary" className="mt-2">
						Please try logging in again.
					</Typography>
					<div className="mt-4 flex gap-4 justify-center">
						<Button onClick={() => router.push('/login')}>
							Go to Login
						</Button>
						<Link href="/" className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
							← Back to home
						</Link>
					</div>
				</div>
			</div>
		);
	} return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
			<nav className="bg-white dark:bg-gray-800 shadow">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between h-16">
						<div className="flex items-center gap-4">
							<Typography variant="h3">
								Dashboard
							</Typography>
							<Link href="/" className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
								← Home
							</Link>
						</div>
						<div className="flex items-center space-x-4">
							<Typography color="secondary">
								Welcome, <strong>{data?.user.username}</strong>
							</Typography>
							<Button
								onClick={handleLogout}
								variant="primary"
								size="small"
								className="bg-red-600 hover:bg-red-700"
							>
								Logout
							</Button>
						</div>
					</div>
				</div>
			</nav>

			<main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
				<div className="px-4 py-6 sm:px-0">
					<div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
						<Typography variant="h2" className="mb-4">
							Protected Content
						</Typography>
						<Typography color="secondary" className="mb-4">
							This page can only be accessed by authenticated users.
						</Typography>
						<div className="border-l-4 border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 p-4">
							<div className="flex">
								<div className="ml-3">
									<Typography variant="small" className="text-indigo-700 dark:text-indigo-300">
										<strong>User Information:</strong>
									</Typography>
									<ul className="mt-2 text-sm text-indigo-700 dark:text-indigo-300">
										<li>ID: {data?.user.id}</li>
										<li>Username: {data?.user.username}</li>
									</ul>
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
