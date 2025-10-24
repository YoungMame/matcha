'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

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
					<p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
				<div className="text-center">
					<h2 className="text-2xl font-bold text-red-600 dark:text-red-400">
						Authentication Error
					</h2>
					<p className="mt-2 text-gray-600 dark:text-gray-400">
						Please try logging in again.
					</p>
					<button
						onClick={() => router.push('/login')}
						className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
					>
						Go to Login
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
			<nav className="bg-white dark:bg-gray-800 shadow">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between h-16">
						<div className="flex items-center">
							<h1 className="text-xl font-bold text-gray-900 dark:text-white">
								Dashboard
							</h1>
						</div>
						<div className="flex items-center space-x-4">
							<span className="text-gray-700 dark:text-gray-300">
								Welcome, <strong>{data?.user.username}</strong>
							</span>
							<button
								onClick={handleLogout}
								className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
							>
								Logout
							</button>
						</div>
					</div>
				</div>
			</nav>

			<main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
				<div className="px-4 py-6 sm:px-0">
					<div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
						<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
							Protected Content
						</h2>
						<p className="text-gray-600 dark:text-gray-400 mb-4">
							This page can only be accessed by authenticated users.
						</p>
						<div className="border-l-4 border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 p-4">
							<div className="flex">
								<div className="ml-3">
									<p className="text-sm text-indigo-700 dark:text-indigo-300">
										<strong>User Information:</strong>
									</p>
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
