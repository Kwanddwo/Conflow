"use Client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

interface LogoProps {
  width?: number;
  height?: number;
}

const Logo: React.FC<LogoProps> = ({ width, height }) => {
  return (
    <Link href="/dashboard">
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
