"use client";

import { useState } from "react";
import Image from "next/image";
import Typography from "@/components/common/Typography";

interface Message {
	id: string;
	senderId: string;
	content: string;
	timestamp: Date;
}

interface ChatInterfaceProps {
	conversationId: string;
	otherUser: {
		id: string;
		name: string;
		pictureUrl: string;
	};
	messages: Message[];
	currentUserId: string;
	onSendMessage?: (content: string) => void;
}

export default function ChatInterface({
	otherUser,
	messages,
	currentUserId,
	onSendMessage,
}: ChatInterfaceProps) {
	const [messageInput, setMessageInput] = useState("");

	const handleSend = () => {
		if (messageInput.trim()) {
			onSendMessage?.(messageInput);
			setMessageInput("");
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	return (
		<div className="flex flex-col flex-1 h-full bg-white dark:bg-gray-800">
			{/* Chat Header */}
			<div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
				<div className="relative w-10 h-10 rounded-full overflow-hidden">
					<Image
						src={otherUser.pictureUrl}
						alt={otherUser.name}
						fill
						className="object-cover"
					/>
				</div>
				<Typography variant="body" className="font-semibold">
					{otherUser.name}
				</Typography>
			</div>

			{/* Messages List */}
			<div className="flex-1 overflow-y-auto p-4 space-y-4">
				{messages.length === 0 ? (
					<div className="flex items-center justify-center h-full">
						<Typography color="secondary">
							Aucun message pour le moment. Commencez la conversation !
						</Typography>
					</div>
				) : (
					messages.map((message) => {
						const isCurrentUser = message.senderId === currentUserId;
						return (
							<div
								key={message.id}
								className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
							>
								<div
									className={`max-w-[70%] rounded-lg px-4 py-2 ${isCurrentUser
										? "bg-indigo-600 text-white"
										: "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
										}`}
								>
									<Typography
										variant="body"
										className={isCurrentUser ? "text-white" : ""}
									>
										{message.content}
									</Typography>
									<Typography
										variant="small"
										className={`mt-1 ${isCurrentUser
											? "text-indigo-200"
											: "text-gray-500 dark:text-gray-400"
											}`}
									>
										{new Date(message.timestamp).toLocaleTimeString("fr-FR", {
											hour: "2-digit",
											minute: "2-digit",
										})}
									</Typography>
								</div>
							</div>
						);
					})
				)}
			</div>

			{/* Message Input */}
			<div className="p-4 border-t border-gray-200 dark:border-gray-700">
				<div className="flex gap-2">
					<input
						type="text"
						value={messageInput}
						onChange={(e) => setMessageInput(e.target.value)}
						onKeyPress={handleKeyPress}
						placeholder="Écrivez un message..."
						className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
					/>
					<button
						onClick={handleSend}
						disabled={!messageInput.trim()}
						className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
					>
						Envoyer
					</button>
				</div>
			</div>
		</div>
	);
}
