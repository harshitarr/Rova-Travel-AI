"use client";;
import { Calendar, CircleDollarSign,Users ,Telescope} from "lucide-react";
import { useScroll, useTransform, motion } from "motion/react";
import React, { useEffect, useRef, useState } from "react";

export const Timeline = ({ data, tripData: TripInfo }) => {
  const ref = useRef(null);
  const containerRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setHeight(rect.height);
    }
  }, [ref]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div
      className="w-full bg-white dark:bg-neutral-950  md:px-2 "
      ref={containerRef}>
      <div className="max-w-7xl mx-auto py-7 px-4 md:px-8 lg:px-10">
        <h2 className="text-lg md:text-4xl mb-4 text-black dark:text-white max-w-4xl font-semibold [word-spacing:4px]">
          Your Trip Itinerary from <span className="text-[#F472B6]">{TripInfo?.trip_plan?.origin || TripInfo?.origin || "Origin"}</span> to <span className="text-[#F472B6]">{TripInfo?.trip_plan?.destination || TripInfo?.destination || "Destination"}</span> is Ready
        </h2>
        <div className="flex flex-wrap gap-3 items-center py-4">
          <div className="flex gap-2 items-center bg-pink-50 px-3 py-2 rounded-full border border-pink-200 hover:bg-pink-100 transition-colors">
            <Calendar className="w-4 h-4 text-pink-500"/>
            <h2 className="text-sm font-medium">{TripInfo?.trip_plan?.duration || TripInfo?.duration || "Duration"}</h2>
          </div>
          <div className="flex gap-2 items-center bg-purple-50 px-3 py-2 rounded-full border border-purple-200 hover:bg-purple-100 transition-colors">
            <CircleDollarSign className="w-4 h-4 text-purple-500"/>
            <h2 className="text-sm font-medium">{TripInfo?.trip_plan?.budget || TripInfo?.budget || "Budget"}</h2>
          </div>
          <div className="flex gap-2 items-center bg-blue-50 px-3 py-2 rounded-full border border-blue-200 hover:bg-blue-100 transition-colors">
            <Users className="w-4 h-4 text-blue-500"/>
            <h2 className="text-sm font-medium">{TripInfo?.trip_plan?.groupSize || TripInfo?.groupSize || "Group Size"}</h2>
          </div>
          <div className="flex gap-2 items-center bg-orange-50 px-3 py-2 rounded-full border border-orange-200 hover:bg-orange-100 transition-colors">
            <Telescope className="w-4 h-4 text-orange-500"/>
            <h2 className="text-sm font-medium">{TripInfo?.trip_plan?.interests || TripInfo?.interests || "Interests"}</h2>
          </div>
        </div>
      </div>
      <div ref={ref} className="relative max-w-7xl mx-auto pb-20">
        {data.map((item, index) => (
          <div key={index} className="flex justify-start pt-10 md:pt-10 md:gap-10">
            <div
              className="sticky flex flex-col md:flex-row z-40 items-center top-40 self-start max-w-xs lg:max-w-sm md:w-[40%]">
              <div
                className="h-10 absolute left-3 md:left-3 w-10 rounded-full bg-white dark:bg-black flex items-center justify-center">
                <div
                  className="h-4 w-4 rounded-full bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 p-2" />
              </div>
              <h3
                className="hidden md:block text-xl md:pl-20 md:text-2xl font-bold text-neutral-500 dark:text-neutral-500 ">
                {item.title}
              </h3>
            </div>

            <div className="relative pl-20 pr-4 md:pl-4 w-full">
              <h3
                className="md:hidden block text-2xl mb-4 text-left font-bold text-neutral-500 dark:text-neutral-500">
                {item.title}
              </h3>
              {item.content}{" "}
            </div>
          </div>
        ))}
        <div
          style={{
            height: height + "px",
          }}
          className="absolute md:left-8 left-8 top-0 overflow-hidden w-[2px] bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-[0%] via-neutral-200 dark:via-neutral-700 to-transparent to-[99%]  [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)] ">
          <motion.div
            style={{
              height: heightTransform,
              opacity: opacityTransform,
            }}
            className="absolute inset-x-0 top-0  w-[2px] bg-gradient-to-t from-purple-500 via-blue-500 to-transparent from-[0%] via-[10%] rounded-full" />
        </div>
      </div>
    </div>
  );
};
