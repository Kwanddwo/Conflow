"use Client";

import Image from "next/image";
import React from "react";

interface LogoProps {
  width?: number;
  height?: number;
}

const Logo: React.FC<LogoProps> = ({
  width,
  height,
}) => {

  return (
    <>
      <Image
        src={`/conflow.png`}
        className={"dark:hidden"}
        width={width || 150}
        height={height || 100}
        alt="Conflow"
      />
    </>
  );
};

export default Logo;
