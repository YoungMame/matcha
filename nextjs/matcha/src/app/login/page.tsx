'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import Button from '@/components/common/Button';
import TextField from '@/components/common/TextField';
import Typography from '@/components/common/Typography';
import Alert from '@/components/common/Alert';

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
					<Typography variant="h2" align="center">
						Sign in to your account
					</Typography>
					<Typography variant="small" color="secondary" align="center" className="mt-2">
						Demo credentials: admin/admin123 or user/user123
					</Typography>
				</div>
				<form className="mt-8 space-y-6" onSubmit={handleSubmit}>
					<div className="space-y-4">
						<TextField
							id="username"
							name="username"
							type="text"
							autoComplete="username"
							required
							label="Username"
							placeholder="Username"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							disabled={isLoading}
						/>
						<TextField
							id="password"
							name="password"
							type="password"
							autoComplete="current-password"
							required
							label="Password"
							placeholder="Password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							disabled={isLoading}
						/>
					</div>

					{error && (
						<Alert variant="error">
							{error}
						</Alert>
					)}

					<Button
						type="submit"
						disabled={isLoading}
						fullWidth
					>
						{isLoading ? 'Signing in...' : 'Sign in'}
					</Button>

					<div className="text-center">
						<Link href="/" className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
							← Back to home
						</Link>
					</div>
				</form>
			</div>
		</div>
	);
}
