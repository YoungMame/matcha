'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function LoginPage() {
	const router = useRouter();
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setIsLoading(true);

		try {
			const response = await axios.post('/api/auth/login', {
				username,
				password,
			});

			if (response.data.success) {
				// Redirect to dashboard after successful login
				router.push('/dashboard');
				router.refresh();
			}
		} catch (err: any) {
			if (axios.isAxiosError(err) && err.response) {
				setError(err.response.data.error || 'Login failed');
			} else {
				setError('An unexpected error occurred');
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				<div>
					<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
						Sign in to your account
					</h2>
					<p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
						Demo credentials: admin/admin123 or user/user123
					</p>
				</div>
				<form className="mt-8 space-y-6" onSubmit={handleSubmit}>
					<div className="rounded-md shadow-sm -space-y-px">
						<div>
							<label htmlFor="username" className="sr-only">
								Username
							</label>
							<input
								id="username"
								name="username"
								type="text"
								autoComplete="username"
								required
								className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm bg-white dark:bg-gray-800"
								placeholder="Username"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								disabled={isLoading}
							/>
						</div>
						<div>
							<label htmlFor="password" className="sr-only">
								Password
							</label>
							<input
								id="password"
								name="password"
								type="password"
								autoComplete="current-password"
								required
								className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm bg-white dark:bg-gray-800"
								placeholder="Password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								disabled={isLoading}
							/>
						</div>
					</div>

					{error && (
						<div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
							<div className="text-sm text-red-800 dark:text-red-200">
								{error}
							</div>
						</div>
					)}

					<div>
						<button
							type="submit"
							disabled={isLoading}
							className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
						>
							{isLoading ? 'Signing in...' : 'Sign in'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
