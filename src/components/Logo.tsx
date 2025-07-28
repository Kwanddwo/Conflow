"use Client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

interface LogoProps {
  width?: number;
  height?: number;
  link : string;
}

const Logo: React.FC<LogoProps> = ({ width, height, link }) => {
  return (
    <Link href={link}>
      <Image
        src={`/conflow.png`}
        className="dark:hidden"
        width={width || 150}
        height={height || 100}
        alt="Conflow"
      />
      <Image
        src={`/conflow-dark.png`}
        className="not-dark:hidden"
        width={width || 150}
        height={height || 100}
        alt="Conflow"
      />
    </Link>
  );
};

export default Logo;
