"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FloatingCard, { CardData } from "./FloatingCard";

const SAMPLE_CARDS: CardData[] = [
  {
    id: 1,
    name: "Sophie",
    age: 24,
    interest: "Photography",
    color: "rgba(236, 72, 153, 0.7)",
    picture: "/mock_pictures/femme1.jpg",
  },
  {
    id: 2,
    name: "Lucas",
    age: 28,
    interest: "Music",
    color: "rgba(59, 130, 246, 0.7)",
    picture: "/mock_pictures/homme1.jpg",
  },
  {
    id: 3,
    name: "Emma",
    age: 26,
    interest: "Travel",
    color: "rgba(168, 85, 247, 0.7)",
    picture: "/mock_pictures/femme2.jpg",
  },
  {
    id: 4,
    name: "Thomas",
    age: 30,
    interest: "Cooking",
    color: "rgba(34, 197, 94, 0.7)",
    picture: "/mock_pictures/homme2.jpg",
  },
  {
    id: 5,
    name: "Léa",
    age: 23,
    interest: "Art",
    color: "rgba(249, 115, 22, 0.7)",
    picture: "/mock_pictures/femme3.jpg",
  },
  {
    id: 6,
    name: "Antoine",
    age: 27,
    interest: "Sports",
    color: "rgba(20, 184, 166, 0.7)",
    picture: "/mock_pictures/homme3.jpg",
  },
//   {
//     id: 7,
//     name: "Chloé",
//     age: 25,
//     interest: "Reading",
//     color: "rgba(244, 63, 94, 0.7)",
//     picture: "/mock_pictures/femme4.jpg",
//   },
//   {
//     id: 8,
//     name: "Hugo",
//     age: 29,
//     interest: "Gaming",
//     color: "rgba(99, 102, 241, 0.7)",
//     picture: "/mock_pictures/homme4.jpg",
//   },
//   {
//     id: 9,
//     name: "Inès",
//     age: 22,
//     interest: "Fashion",
//     color: "rgba(254, 202, 202, 0.7)",
//     picture: "/mock_pictures/femme5.jpg",
//   },
//   {
//     id: 10,
//     name: "Maxime",
//     age: 31,
//     interest: "Fitness",
//     color: "rgba(34, 211, 238, 0.7)",
//     picture: "/mock_pictures/homme5.jpg",
//   },
];

export default function AnimatedBackground() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [collisionSmileys, setCollisionSmileys] = useState<
    Array<{ id: string; x: number; y: number }>
  >([]);
  const [visibleCards, setVisibleCards] = useState<CardData[]>(SAMPLE_CARDS);

  // Use ref to track positions without triggering re-renders
  const cardPositionsRef = useRef<Map<number, { x: number; y: number }>>(
    new Map()
  );

  useEffect(() => {
    const updateDimensions = () => {
      // Account for header height (64px = h-16)
      const headerHeight = 64;
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight - headerHeight,
      });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const handlePositionUpdate = (id: number, x: number, y: number) => {
    cardPositionsRef.current.set(id, { x, y });
  };

  const getOtherCardPositions = (currentCardId: number) => {
    const positions: Array<{ id: number; x: number; y: number }> = [];
    cardPositionsRef.current.forEach((pos, id) => {
      if (id !== currentCardId) {
        positions.push({ id, x: pos.x, y: pos.y });
      }
    });
    return positions;
  };

  const handleCollision = (
    x: number,
    y: number,
    cardId1: number,
    cardId2: number
  ) => {
    // Defer state updates to avoid render-phase setState error
    setTimeout(() => {
      const smileyId = `smiley-${Date.now()}-${Math.random()}`;
      setCollisionSmileys((prev) => [...prev, { id: smileyId, x, y }]);

      // Remove both colliding cards
    //   setVisibleCards((prev) =>
    //     prev.filter((card) => card.id !== cardId1 && card.id !== cardId2)
    //   );

    //   // Remove card positions from ref
    //   cardPositionsRef.current.delete(cardId1);
    //   cardPositionsRef.current.delete(cardId2);

      // Remove smiley after 1 second
      setTimeout(() => {
        setCollisionSmileys((prev) => prev.filter((s) => s.id !== smileyId));
      }, 1000);
    }, 0);
  };

  if (dimensions.width === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="relative w-full h-full">
        <AnimatePresence>
          {visibleCards.map((card) => (
            <motion.div
              key={card.id}
              className="pointer-events-auto"
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.3 }}
            >
              <FloatingCard
                card={card}
                containerWidth={dimensions.width}
                containerHeight={dimensions.height}
                onPositionUpdate={handlePositionUpdate}
                getOtherCards={() => getOtherCardPositions(card.id)}
                onCollision={handleCollision}
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Collision smileys */}
        <AnimatePresence>
          {collisionSmileys.map((smiley) => (
            <motion.div
              key={smiley.id}
              className="absolute pointer-events-none"
              style={{
                left: smiley.x,
                top: smiley.y,
                transform: "translate(-50%, -50%)",
              }}
              initial={{ opacity: 1, scale: 0.5 }}
              animate={{ opacity: 0, scale: 1.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <span className="text-6xl">❤️</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}