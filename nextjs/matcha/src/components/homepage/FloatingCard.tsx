"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export interface CardData {
  id: number;
  name: string;
  age: number;
  interest: string;
  color: string;
  picture: string;
}

interface FloatingCardProps {
  card: CardData;
  containerWidth: number;
  containerHeight: number;
  onPositionUpdate: (id: number, x: number, y: number) => void;
  getOtherCards: () => Array<{ id: number; x: number; y: number }>;
  onCollision?: (
    x: number,
    y: number,
    cardId1: number,
    cardId2: number
  ) => void;
}

const CARD_WIDTH = 140;
const CARD_HEIGHT = 180;

export default function FloatingCard({
  card,
  containerWidth,
  containerHeight,
  onPositionUpdate,
  getOtherCards,
  onCollision,
}: FloatingCardProps) {
  const [position, setPosition] = useState({
    x: Math.random() * (containerWidth - CARD_WIDTH),
    y: Math.random() * (containerHeight - CARD_HEIGHT),
  });

  const [velocity, setVelocity] = useState({
    x: (Math.random() - 0.5) * 2,
    y: (Math.random() - 0.5) * 2,
  });

  const [isColliding, setIsColliding] = useState(false);
  const animationFrameRef = useRef<number | null>(null);
  const lastCollisionRef = useRef<boolean>(false);

  useEffect(() => {
    const animate = () => {
      setPosition((prev) => {
        let newX = prev.x + velocity.x;
        let newY = prev.y + velocity.y;
        let newVelocityX = velocity.x;
        let newVelocityY = velocity.y;

        // Bounce off walls
        if (newX <= 0 || newX >= containerWidth - CARD_WIDTH) {
          newVelocityX = -newVelocityX;
          newX = newX <= 0 ? 0 : containerWidth - CARD_WIDTH;
        }
        if (newY <= 0 || newY >= containerHeight - CARD_HEIGHT) {
          newVelocityY = -newVelocityY;
          newY = newY <= 0 ? 0 : containerHeight - CARD_HEIGHT;
        }

        // Update position in parent (using ref, not state)
        onPositionUpdate(card.id, newX, newY);

        // Check collision with other cards using AABB (Axis-Aligned Bounding Box)
        let collisionDetected = false;
        const otherCards = getOtherCards();

        otherCards.forEach((other) => {
          // Rectangle collision detection
          const isOverlappingX =
            newX < other.x + CARD_WIDTH && newX + CARD_WIDTH > other.x;
          const isOverlappingY =
            newY < other.y + CARD_HEIGHT && newY + CARD_HEIGHT > other.y;

          if (isOverlappingX && isOverlappingY) {
            collisionDetected = true;

            // Calculate centers for collision response
            const centerX = newX + CARD_WIDTH / 2;
            const centerY = newY + CARD_HEIGHT / 2;
            const otherCenterX = other.x + CARD_WIDTH / 2;
            const otherCenterY = other.y + CARD_HEIGHT / 2;

            // Calculate midpoint between the two cards for smiley position
            const midX = (centerX + otherCenterX) / 2;
            const midY = (centerY + otherCenterY) / 2;

            // Only trigger collision callback on first collision (not every frame)
            if (!lastCollisionRef.current && onCollision) {
              onCollision(midX, midY, card.id, other.id);
            }

            const dx = centerX - otherCenterX;
            const dy = centerY - otherCenterY;

            // Calculate collision angle
            const angle = Math.atan2(dy, dx);
            const speed = Math.sqrt(
              newVelocityX * newVelocityX + newVelocityY * newVelocityY
            );

            // Reflect velocity based on collision angle
            newVelocityX = Math.cos(angle) * speed;
            newVelocityY = Math.sin(angle) * speed;

            // Calculate overlap amounts on each axis
            const overlapX = CARD_WIDTH - Math.abs(centerX - otherCenterX);
            const overlapY = CARD_HEIGHT - Math.abs(centerY - otherCenterY);

            // Push cards apart along the axis of least overlap
            if (overlapX < overlapY) {
              // Separate horizontally
              newX = dx > 0 ? other.x + CARD_WIDTH : other.x - CARD_WIDTH;
            } else {
              // Separate vertically
              newY = dy > 0 ? other.y + CARD_HEIGHT : other.y - CARD_HEIGHT;
            }
          }
        });

        setIsColliding(collisionDetected);
        lastCollisionRef.current = collisionDetected;

        if (newVelocityX !== velocity.x || newVelocityY !== velocity.y) {
          setVelocity({ x: newVelocityX, y: newVelocityY });
        }

        return { x: newX, y: newY };
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    velocity,
    containerWidth,
    containerHeight,
    card.id,
    onPositionUpdate,
    getOtherCards,
    onCollision,
  ]);

  return (
    <motion.div
      className="absolute rounded-lg shadow-lg overflow-hidden backdrop-blur-sm cursor-pointer bg-white dark:bg-gray-800"
      style={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        left: position.x,
        top: position.y,
      }}
      animate={{
        scale: isColliding ? 1.15 : 1,
        rotate: isColliding ? [0, -5, 5, 0] : 0,
      }}
      transition={{
        scale: { duration: 0.3 },
        rotate: { duration: 0.5 },
      }}
      whileHover={{
        scale: 1.2,
        zIndex: 10,
      }}
    >
      <div className="flex flex-col h-full">
        {/* Picture */}
        <div className="relative w-full h-24 shrink-0">
          <Image
            src={card.picture}
            alt={card.name}
            fill
            className="object-cover"
            sizes="140px"
          />
        </div>
        
        {/* Info Section */}
        <div className="flex flex-col items-center justify-center flex-1 p-2 bg-linear-to-b from-transparent to-white/10">
          <p className="font-bold text-sm text-gray-800 dark:text-white">{card.name}</p>
          <p className="text-xs text-gray-600 dark:text-gray-300">{card.age} ans</p>
          <p className="text-xs mt-1 text-center text-gray-500 dark:text-gray-400 line-clamp-2">
            {card.interest}
          </p>
        </div>
      </div>
    </motion.div>
  );
}