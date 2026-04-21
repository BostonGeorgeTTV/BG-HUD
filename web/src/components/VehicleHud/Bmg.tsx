import { iVehicleInfo } from "../../orhud/BasicTypes";
import SeatbeltIcon from './SeatbeltIcon'
import { useEffect, useRef, useState } from "react";
import MileagePill from './MileagePill'

type TypeClassic = {
  veh: iVehicleInfo;
  heading?: number;
  mileage: number;
  mileageUnit: 'kilometers' | 'miles';
};

const Bmg = ({ veh, heading = 0, mileage, mileageUnit }: TypeClassic) => {
  const isVehPlane = [15, 16].includes(veh.veh_class);
  const isVehBoat = [14].includes(veh.veh_class);
  const isVehCar = ![14, 15, 16].includes(veh.veh_class);

  const iGear =
    typeof veh.currentGear == "string"
      ? veh.currentGear.toLocaleLowerCase() == "r"
        ? 1
        : 0
      : veh.currentGear;

  const calcSpeedRatio = (speed: number) => {
    const ranges = [0, 10, 20, 40, 60, 80, 120, 160, 180];
    const ratios = [0.1, 0.175, 0.2325, 0.29, 0.335, 0.385, 0.435, 0.485, 0.6];

    if (speed >= 180) {
      return 1.0;
    }

    for (let i = 0; i < ranges.length - 1; i++) {
      if (speed >= ranges[i] && speed <= ranges[i + 1]) {
        const ratioDiff = ratios[i + 1] - ratios[i];
        const rangeDiff = ranges[i + 1] - ranges[i];
        const speedDiff = speed - ranges[i];
        return ratios[i] + (speedDiff / rangeDiff) * ratioDiff;
      }
    }

    return 0;
  };

  const gearRef = useRef<SVGPathElement | null>(null);
  const [gearPathLength, setGearPathLength] = useState<number>(0);
  const gearRatios = [0, 1 / 7.5, 3 / 16, 4 / 16.5, 4 / 13, 5 / 14.3, 6 / 15.15, 7 / 15.5, 1];
  const gearFilledLength = (gearRatios[iGear] ?? 0) * gearPathLength;
  const gearStrokeDashoffsetValue = gearPathLength - gearFilledLength;

  const speedRef = useRef<SVGPathElement | null>(null);
  const [speedPathLength, setSpeedPathLength] = useState<number>(0);
  const speedRatio = calcSpeedRatio(veh.speed);
  const speedFilledLength = speedRatio * speedPathLength;
  const speedStrokeDashoffsetValue = speedPathLength - speedFilledLength;

  useEffect(() => {
    if (gearRef.current) {
      requestAnimationFrame(() => {
        if (gearRef.current) {
          const length = gearRef.current.getTotalLength();
          setGearPathLength(length);
        }
      });
    }

    if (speedRef.current) {
      requestAnimationFrame(() => {
        if (speedRef.current) {
          const length = speedRef.current.getTotalLength();
          setSpeedPathLength(length);
        }
      });
    }
  }, []);

  const formatSpeed = (x: number): string => {
    return x?.toString()?.padStart(3, "0") || "000";
  };

  return (
    <div
      className="veh-hud-bmg relative translate-y-8 scale-110 4k:-translate-x-20 4k:-translate-y-6"
      style={{ width: 380, height: 166 }}
    >
      <div className="relative flex items-center justify-between z-10">
        <div id="left-speed">
          <svg width="187" height="170" viewBox="0 0 187 170" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M171.371 168.752H175.3C176.729 168.752 178.101 168.184 179.112 167.172L186.005 160.279" stroke="white" strokeOpacity="0.1" strokeWidth="2.31061" />
            <path d="M84.3398 168.752L169.832 168.752" stroke="white" strokeOpacity="0.1" strokeWidth="2.31061" />
            <path d="M175.991 2.00391C142.537 4.74289 119.365 6.2928 89.3366 12.2009C79.0991 14.2151 69.2696 18.0103 60.3924 23.4928C42.3452 34.6388 28.8946 45.3301 14.0535 62.1868C4.91869 72.5622 2.77911 87.3545 8.2445 100.052C18.133 123.025 28.3343 139.568 45.9881 159.626C51.1879 165.534 58.7637 168.753 66.6341 168.753H82.7969" stroke="white" strokeOpacity="0.1" strokeWidth="2.31061" />
            <path d="M81.2578 166.441H82.7982L85.1088 162.59H83.5684L81.2578 166.441Z" fill="white" fillOpacity="0.5" />
            <path d="M62 166.441H63.5404L65.851 162.59H64.3106L62 166.441Z" fill="white" fillOpacity="0.5" />
            <path d="M45.0568 154.741L46.2306 155.739L50.4851 154.301L49.3114 153.303L45.0568 154.741Z" fill="white" fillOpacity="0.5" />
            <path d="M77.4062 166.441H78.9467L80.4871 164.131H78.9467L77.4062 166.441Z" fill="white" fillOpacity="0.1" />
            <path d="M73.5547 166.441H75.0951L76.6355 164.131H75.0951L73.5547 166.441Z" fill="white" fillOpacity="0.1" />
            <path d="M69.7031 166.441H71.2435L72.7839 164.131H71.2435L69.7031 166.441Z" fill="white" fillOpacity="0.1" />
            <path d="M32.8952 47.0617L31.7886 48.1333L32.8078 52.5071L33.9144 51.4355L32.8952 47.0617Z" fill="white" fillOpacity="0.5" />
            <path d="M24.0632 55.7233L23.0077 56.8453L23.635 59.5505L24.6906 58.4286L24.0632 55.7233Z" fill="white" fillOpacity="0.1" />
            <path d="M26.7038 52.9187L25.6483 54.0406L26.2757 56.7458L27.3312 55.6239L26.7038 52.9187Z" fill="white" fillOpacity="0.1" />
            <path d="M29.3406 50.1159L28.285 51.2378L28.9124 53.9431L29.9679 52.8211L29.3406 50.1159Z" fill="white" fillOpacity="0.1" />
            <path d="M45.9044 36.7914L44.6827 37.7297L45.1957 42.1913L46.4174 41.253L45.9044 36.7914Z" fill="white" fillOpacity="0.5" />
            <path d="M36.1418 44.3892L34.965 45.3832L35.2793 48.1424L36.4561 47.1483L36.1418 44.3892Z" fill="white" fillOpacity="0.1" />
            <path d="M39.0832 41.9028L37.9064 42.8969L38.2207 45.6561L39.3975 44.662L39.0832 41.9028Z" fill="white" fillOpacity="0.1" />
            <path d="M42.0207 39.4185L40.8439 40.4125L41.1582 43.1717L42.335 42.1776L42.0207 39.4185Z" fill="white" fillOpacity="0.1" />
            <path d="M59.3411 27.5641L58.073 28.4386L58.3571 32.9207L59.6252 32.0461L59.3411 27.5641Z" fill="white" fillOpacity="0.5" />
            <path d="M49.2027 34.6531L47.9767 35.5857L48.1495 38.3573L49.3755 37.4247L49.2027 34.6531Z" fill="white" fillOpacity="0.1" />
            <path d="M52.2691 32.323L51.0431 33.2556L51.2159 36.0272L52.4419 35.0947L52.2691 32.323Z" fill="white" fillOpacity="0.1" />
            <path d="M55.3316 29.991L54.1056 30.9236L54.2784 33.6952L55.5044 32.7626L55.3316 29.991Z" fill="white" fillOpacity="0.1" />
            <path d="M74.8956 19.3346L73.5232 20.0342L73.2135 24.5145L74.5859 23.815L74.8956 19.3346Z" fill="white" fillOpacity="0.5" />
            <path d="M63.9068 25.0237L62.5685 25.7863L62.374 28.5565L63.7124 27.7939L63.9068 25.0237Z" fill="white" fillOpacity="0.1" />
            <path d="M67.2584 23.1155L65.92 23.8781L65.7256 26.6483L67.064 25.8857L67.2584 23.1155Z" fill="white" fillOpacity="0.1" />
            <path d="M70.5982 21.2112L69.2599 21.9738L69.0654 24.744L70.4038 23.9814L70.5982 21.2112Z" fill="white" fillOpacity="0.1" />
            <path d="M91.5126 14.7094L90.0237 15.1043L88.7777 19.4191L90.2666 19.0241L91.5126 14.7094Z" fill="white" fillOpacity="0.5" />
            <path d="M79.5738 17.9626L78.1049 18.4264L77.3317 21.0936L78.8006 20.6298L79.5738 17.9626Z" fill="white" fillOpacity="0.1" />
            <path d="M83.2457 16.8005L81.7768 17.2643L81.0036 19.9315L82.4725 19.4677L83.2457 16.8005Z" fill="white" fillOpacity="0.1" />
            <path d="M86.9176 15.6423L85.4487 16.1061L84.6754 18.7733L86.1444 18.3095L86.9176 15.6423Z" fill="white" fillOpacity="0.1" />
            <path d="M108.074 12.1238L106.549 12.3378L104.796 16.4725L106.321 16.2585L108.074 12.1238Z" fill="white" fillOpacity="0.5" />
            <path d="M95.8307 13.9226L94.3169 14.2073L93.2301 16.7628L94.7439 16.4781L95.8307 13.9226Z" fill="white" fillOpacity="0.1" />
            <path d="M99.6198 13.2097L98.1059 13.4944L97.0191 16.0499L98.533 15.7652L99.6198 13.2097Z" fill="white" fillOpacity="0.1" />
            <path d="M103.401 12.4968L101.887 12.7815L100.8 15.337L102.314 15.0523L103.401 12.4968Z" fill="white" fillOpacity="0.1" />
            <path d="M125.024 9.32109L123.498 9.53508L121.745 13.6697L123.27 13.4557L125.024 9.32109Z" fill="white" fillOpacity="0.5" />
            <path d="M112.78 11.1198L111.266 11.4045L110.179 13.9601L111.693 13.6753L112.78 11.1198Z" fill="white" fillOpacity="0.1" />
            <path d="M116.569 10.4069L115.055 10.6916L113.968 13.2472L115.482 12.9624L116.569 10.4069Z" fill="white" fillOpacity="0.1" />
            <path d="M120.35 9.69404L118.836 9.97876L117.75 12.5343L119.263 12.2496L120.35 9.69404Z" fill="white" fillOpacity="0.1" />
            <path d="M142.051 7.7794L140.518 7.93257L138.602 11.9943L140.134 11.8411L142.051 7.7794Z" fill="white" fillOpacity="0.5" />
            <path d="M129.746 9.09097L128.222 9.31527L127.034 11.8256L128.558 11.6013L129.746 9.09097Z" fill="white" fillOpacity="0.1" />
            <path d="M133.558 8.52847L132.034 8.75277L130.847 11.2631L132.371 11.0388L133.558 8.52847Z" fill="white" fillOpacity="0.1" />
            <path d="M137.367 7.96597L135.843 8.19027L134.655 10.7006L136.179 10.4763L137.367 7.96597Z" fill="white" fillOpacity="0.1" />
            <path d="M158.996 6.24033L157.463 6.3935L155.547 10.4552L157.08 10.302L158.996 6.24033Z" fill="white" fillOpacity="0.5" />
            <path d="M146.691 7.54995L145.167 7.77426L143.979 10.2845L145.503 10.0602L146.691 7.54995Z" fill="white" fillOpacity="0.1" />
            <path d="M150.503 6.98745L148.979 7.21176L147.792 9.72204L149.316 9.49774L150.503 6.98745Z" fill="white" fillOpacity="0.1" />
            <path d="M154.312 6.42495L152.788 6.64926L151.6 9.15954L153.124 8.93524L154.312 6.42495Z" fill="white" fillOpacity="0.1" />
            <path d="M175.941 4.69932L174.409 4.85249L172.492 8.91417L174.025 8.761L175.941 4.69932Z" fill="white" fillOpacity="0.5" />
            <path d="M163.636 6.01089L162.112 6.23519L160.925 8.74548L162.449 8.52118L163.636 6.01089Z" fill="white" fillOpacity="0.1" />
            <path d="M167.449 5.44839L165.925 5.67269L164.737 8.18298L166.261 7.95868L167.449 5.44839Z" fill="white" fillOpacity="0.1" />
            <path d="M171.257 4.88589L169.733 5.11019L168.546 7.62048L170.07 7.39618L171.257 4.88589Z" fill="white" fillOpacity="0.1" />
            <path d="M65.8516 166.441H67.392L68.9324 164.131H67.392L65.8516 166.441Z" fill="white" fillOpacity="0.1" />
            <path d="M32.7335 139.63L33.7162 140.817L38.1558 140.14L37.1732 138.953L32.7335 139.63Z" fill="white" fillOpacity="0.5" />
            <path d="M42.5604 151.494L43.5431 152.68L46.3051 152.392L45.3225 151.206L42.5604 151.494Z" fill="white" fillOpacity="0.1" />
            <path d="M40.1034 148.527L41.086 149.713L43.8481 149.425L42.8655 148.239L40.1034 148.527Z" fill="white" fillOpacity="0.1" />
            <path d="M37.6503 145.562L38.6329 146.748L41.395 146.46L40.4123 145.274L37.6503 145.562Z" fill="white" fillOpacity="0.1" />
            <path d="M35.1893 142.595L36.172 143.781L38.9341 143.494L37.9514 142.307L35.1893 142.595Z" fill="white" fillOpacity="0.1" />
            <path d="M22.5527 124.013L23.4205 125.286L27.904 125.025L27.0361 123.753L22.5527 124.013Z" fill="white" fillOpacity="0.5" />
            <path d="M31.2277 136.739L32.0956 138.012L34.8724 137.983L34.0046 136.71L31.2277 136.739Z" fill="white" fillOpacity="0.1" />
            <path d="M29.0597 133.56L29.9276 134.832L32.7044 134.803L31.8366 133.53L29.0597 133.56Z" fill="white" fillOpacity="0.1" />
            <path d="M26.8879 130.376L27.7557 131.649L30.5326 131.62L29.6647 130.347L26.8879 130.376Z" fill="white" fillOpacity="0.1" />
            <path d="M24.7199 127.192L25.5877 128.465L28.3646 128.436L27.4968 127.163L24.7199 127.192Z" fill="white" fillOpacity="0.1" />
            <path d="M13.3538 107.212L14.0973 108.561L18.5852 108.726L17.8418 107.377L13.3538 107.212Z" fill="white" fillOpacity="0.5" />
            <path d="M20.7888 120.699L21.5323 122.048L24.2994 122.282L23.556 120.933L20.7888 120.699Z" fill="white" fillOpacity="0.1" />
            <path d="M18.9334 117.33L19.6768 118.679L22.444 118.913L21.7005 117.564L18.9334 117.33Z" fill="white" fillOpacity="0.1" />
            <path d="M17.074 113.955L17.8175 115.304L20.5846 115.538L19.8411 114.189L17.074 113.955Z" fill="white" fillOpacity="0.1" />
            <path d="M15.2146 110.582L15.9581 111.931L18.7252 112.165L17.9818 110.816L15.2146 110.582Z" fill="white" fillOpacity="0.1" />
            <path d="M7.32002 91.0509L7.97243 92.4464L12.4396 92.9085L11.7872 91.5131L7.32002 91.0509Z" fill="white" fillOpacity="0.5" />
            <path d="M11.9412 104.139L12.6846 105.488L15.4518 105.722L14.7083 104.373L11.9412 104.139Z" fill="white" fillOpacity="0.1" />
            <path d="M10.4615 101.055L11.114 102.45L13.8595 102.867L13.2071 101.472L10.4615 101.055Z" fill="white" fillOpacity="0.1" />
            <path d="M9.12951 97.881L9.78192 99.2764L12.5275 99.6932L11.8751 98.2978L9.12951 97.881Z" fill="white" fillOpacity="0.1" />
            <path d="M7.82873 94.1993L8.48114 95.5947L11.2267 96.0116L10.5743 94.6161L7.82873 94.1993Z" fill="white" fillOpacity="0.1" />
            <path d="M9.70227 73.2476L9.58959 74.7839L13.2613 77.37L13.374 75.8337L9.70227 73.2476Z" fill="white" fillOpacity="0.5" />
            <path d="M7.31506 87.6929L7.70404 89.1833L10.3288 90.0903L9.93977 88.5999L7.31506 87.6929Z" fill="white" fillOpacity="0.1" />
            <path d="M7.31794 83.4887L7.47053 85.0215L9.92237 86.3254L9.76978 84.7926L7.31794 83.4887Z" fill="white" fillOpacity="0.1" />
            <path d="M7.72243 80.2558L7.83049 81.7925L10.2435 83.167L10.1354 81.6304L7.72243 80.2558Z" fill="white" fillOpacity="0.1" />
            <path d="M8.45192 76.3562L8.49276 77.896L10.8434 79.3747L10.8026 77.8348L8.45192 76.3562Z" fill="white" fillOpacity="0.1" />
            <path d="M20.7976 58.6122L19.9057 59.8681L21.7079 63.9817L22.5997 62.7257L20.7976 58.6122Z" fill="white" fillOpacity="0.5" />
            <path d="M11.2774 69.738L10.8384 71.2146L12.6143 73.3496L13.0532 71.873L11.2774 69.738Z" fill="white" fillOpacity="0.1" />
            <path d="M13.4535 66.142L12.7904 67.5324L14.2128 69.9175L14.8759 68.5271L13.4535 66.142Z" fill="white" fillOpacity="0.1" />
            <path d="M15.4715 63.5878L14.7683 64.9584L16.121 67.3837L16.8242 66.0131L15.4715 63.5878Z" fill="white" fillOpacity="0.1" />
            <path d="M18.1211 60.624L17.3588 61.9625L18.6042 64.4446L19.3665 63.1061L18.1211 60.624Z" fill="white" fillOpacity="0.1" />
            <path d="M57.2606 164.483L58.7637 164.82L60.7719 162.902L59.2688 162.565L57.2606 164.483Z" fill="white" fillOpacity="0.1" />
            <path d="M53.5313 162.373L54.9274 163.024L57.3 161.581L55.9039 160.93L53.5313 162.373Z" fill="white" fillOpacity="0.1" />
            <path d="M50.4486 160.008L51.8081 160.732L54.2541 159.417L52.8946 158.693L50.4486 160.008Z" fill="white" fillOpacity="0.1" />
            <path d="M47.3637 157.435L48.5822 158.378L51.2143 157.492L49.9958 156.55L47.3637 157.435Z" fill="white" fillOpacity="0.1" />
            <path d="M71.3873 160.432L116.457 161.048L96.5953 103.41C92.1891 90.6232 94.0358 76.5101 101.584 65.2875L129.409 23.9142C130.391 22.454 131.892 21.422 133.607 21.0274L174.454 11.6289C133.294 14.0818 110.543 17.8453 88.7379 22.6787C83.2656 23.8917 77.977 25.8552 73.0736 28.5705C50.3279 41.1662 34.6462 53.0928 18.9087 73.5182C14.3873 79.3863 13.5437 87.2591 16.3178 94.128C26.0698 118.275 33.7569 133.346 53.1958 152.938C57.9918 157.772 64.5785 160.339 71.3873 160.432Z" fill="white" fillOpacity="0.06" />
            <path d="M114.286 159.478L71.4083 158.892C64.9672 158.804 58.7771 156.376 54.2893 151.853C35.0477 132.46 27.4558 117.594 17.7461 93.5512C15.162 87.1527 15.9644 79.8633 20.1289 74.4583C35.706 54.2412 51.2063 42.4406 73.8198 29.9181C78.588 27.2776 83.7368 25.365 89.0712 24.1826C107.061 20.1947 125.704 16.9351 154.924 14.5418L133.262 19.5262C131.166 20.0085 129.331 21.2699 128.131 23.0546L100.305 64.4279C92.488 76.0512 90.5754 90.6683 95.1389 103.912L114.286 159.478Z" stroke="url(#paint0_linear_318_5)" strokeOpacity="0.04" strokeWidth="3.08081" />
            <mask id="mask0_318_5" style={{ maskType: "alpha" }} maskUnits="userSpaceOnUse" x="13" y="11" width="170" height="153">
              <path d="M70.6457 152.917L114.009 153.467L116.691 162.2L74.7748 163.054C65.2579 163.248 55.8764 159.964 49.2712 153.11C32.6551 135.868 23.6895 119.202 14.9176 96.6281C11.4653 87.7436 12.8264 77.664 18.4932 69.9998C30.551 53.6916 41.2105 42.6711 65.957 29.6861C73.5555 25.699 81.7356 22.8852 90.16 21.2535C117.023 16.0503 142.463 14.4012 169.32 12.2904C173.585 11.8542 177.872 11.4984 182.158 11.2402C177.836 11.6123 173.56 11.9571 169.32 12.2904C137.162 15.5793 106.219 23.4395 85.7938 28.4707C80.309 29.8218 74.993 31.7865 70.072 34.56C50.5542 45.5603 36.887 56.0999 23.267 73.7298C18.7785 79.5398 17.9505 87.3354 20.6876 94.148C29.0593 114.985 35.8786 128.324 52.34 145.297C57.1214 150.228 63.7783 152.83 70.6457 152.917Z" fill="white" />
            </mask>
            <g mask="url(#mask0_318_5)">
              <g filter="url(#filter0_f_318_5)">
                <path
                  style={{ transition: `stroke-dashoffset .3s linear` }}
                  ref={speedRef}
                  fill="none"
                  stroke="#B61239"
                  strokeWidth={25}
                  strokeDasharray={speedPathLength}
                  strokeDashoffset={speedStrokeDashoffsetValue}
                  d="M74.8613 150.913L113.225 151.417L115.536 158.349L76.9495 159.164C66.666 159.382 56.6358 155.482 49.6922 147.893C35.2765 132.139 26.0109 118.289 17.3813 98.311C13.4841 89.2887 14.9484 78.8387 20.9289 71.0398C31.1733 57.6803 39.5036 49.6004 62.3024 35.629C72.7109 29.2505 84.215 24.7438 96.2352 22.6138C122.871 17.8939 144.116 17.1213 173.706 14.6641L165.821 21.5558C129.584 23.6609 109.346 26.8762 90.1253 31.0006C84.7497 32.1541 79.551 34.0339 74.7194 36.6575C55.3333 47.1842 41.7162 57.2564 28.2061 73.9806C23.4477 79.871 22.5729 87.9531 25.495 94.9388C33.7433 114.657 40.6037 127.42 56.9212 143.632C61.6696 148.35 68.1683 150.825 74.8613 150.913Z"
                />
              </g>
            </g>
            <path d="M174.454 8.93164C142.379 11.6728 121.153 13.3656 91.9031 19.3957C82.7608 21.2804 73.8735 24.389 65.6823 28.8653C40.8428 42.4394 29.6093 53.7965 17.1813 70.3386C11.3652 78.0799 10.008 88.3517 13.693 97.3058C23.5119 121.165 33.7591 137.799 52.5432 155.993C57.2853 160.586 63.7458 162.896 70.346 162.758L115.533 161.817" stroke="#601F2F" strokeWidth="0.770203" />
            <path d="M174.454 8.93164C142.379 11.6728 121.153 13.3656 91.9031 19.3957C82.7608 21.2804 73.8735 24.389 65.6823 28.8653C40.8428 42.4394 29.6093 53.7965 17.1813 70.3386C11.3652 78.0799 10.008 88.3517 13.693 97.3058C23.5127 121.167 33.7608 137.802 52.5479 155.997C57.2873 160.587 63.7432 162.898 70.3397 162.763L116.689 161.817" stroke="#601F2F" strokeWidth="0.770203" />
            <g filter="url(#filter1_f_318_5)">
              <path d="M174.454 8.93164C142.379 11.6728 121.153 13.3656 91.9031 19.3957C82.7608 21.2804 73.8735 24.389 65.6823 28.8653C40.8428 42.4394 29.6093 53.7965 17.1813 70.3386C11.3652 78.0799 10.008 88.3517 13.693 97.3058C23.5127 121.167 33.7608 137.802 52.5479 155.997C57.2873 160.587 63.7432 162.898 70.3397 162.763L116.689 161.817" stroke="#601F2F" strokeWidth="0.770203" />
            </g>
            <g filter="url(#filter2_f_318_5)">
              <path d="M174.454 8.93164C142.379 11.6728 121.153 13.3656 91.9031 19.3957C82.7608 21.2804 73.8735 24.389 65.6823 28.8653C40.8428 42.4394 29.6093 53.7965 17.1813 70.3386C11.3652 78.0799 10.008 88.3517 13.693 97.3058C23.5127 121.167 33.7608 137.802 52.5479 155.997C57.2873 160.587 63.7432 162.898 70.3397 162.763L116.689 161.817" stroke="#601F2F" strokeWidth="0.770203" />
            </g>
            <g filter="url(#filter3_f_318_5)">
              <path d="M174.454 8.93164C142.379 11.6728 121.153 13.3656 91.9031 19.3957C82.7608 21.2804 73.8735 24.389 65.6823 28.8653C40.8428 42.4394 29.6093 53.7965 17.1813 70.3386C11.3652 78.0799 10.008 88.3517 13.693 97.3058C23.5127 121.167 33.7608 137.802 52.5479 155.997C57.2873 160.587 63.7432 162.898 70.3397 162.763L116.689 161.817" stroke="#601F2F" strokeWidth="0.770203" />
            </g>
            <path d="M84.9208 159.167C84.4079 159.165 83.9665 159.039 83.5968 158.789C83.229 158.538 82.9457 158.175 82.7469 157.7C82.5501 157.225 82.4527 156.654 82.4547 155.986C82.4547 155.32 82.5531 154.752 82.7499 154.283C82.9487 153.814 83.232 153.457 83.5998 153.212C83.9695 152.966 84.4099 152.843 84.9208 152.843C85.4317 152.843 85.871 152.966 86.2388 153.212C86.6086 153.459 86.8928 153.817 87.0916 154.286C87.2904 154.753 87.3888 155.32 87.3869 155.986C87.3869 156.656 87.2875 157.228 87.0887 157.703C86.8918 158.178 86.6096 158.541 86.2418 158.792C85.874 159.042 85.4337 159.167 84.9208 159.167Z" fill="white" fillOpacity="0.57" />
            <path d="M89.2566 159.113V156.441H89.9629V156.913H89.9942C90.0499 156.756 90.1426 156.633 90.2725 156.542C90.4024 156.452 90.5578 156.407 90.7387 156.407C90.9219 156.407 91.0779 156.452 91.2066 156.544C91.3353 156.635 91.4211 156.757 91.464 156.913H91.4919C91.5464 156.76 91.645 156.637 91.7876 156.546C91.9314 156.453 92.1013 156.407 92.2973 156.407C92.5466 156.407 92.7489 156.486 92.9043 156.645C93.0609 156.803 93.1392 157.026 93.1392 157.316V159.113H92.3999V157.463C92.3999 157.314 92.3605 157.203 92.2816 157.129C92.2027 157.054 92.1042 157.017 91.9859 157.017C91.8514 157.017 91.7464 157.06 91.671 157.146C91.5957 157.231 91.558 157.342 91.558 157.482V159.113H90.8396V157.447C90.8396 157.316 90.8019 157.211 90.7265 157.134C90.6523 157.056 90.5543 157.017 90.4325 157.017C90.3502 157.017 90.276 157.038 90.2099 157.08C90.1449 157.12 90.0933 157.178 90.0551 157.252C90.0168 157.325 89.9977 157.411 89.9977 157.509V159.113H89.2566ZM93.7245 160.115V156.441H94.4551V156.89H94.4881C94.5206 156.818 94.5676 156.745 94.629 156.671C94.6916 156.596 94.7728 156.533 94.8726 156.483C94.9734 156.432 95.0987 156.407 95.2483 156.407C95.4431 156.407 95.6228 156.458 95.7875 156.56C95.9522 156.661 96.0838 156.813 96.1824 157.017C96.281 157.22 96.3302 157.475 96.3302 157.781C96.3302 158.079 96.2821 158.331 96.1859 158.536C96.0908 158.74 95.9609 158.895 95.7962 159C95.6327 159.105 95.4495 159.157 95.2465 159.157C95.1027 159.157 94.9804 159.133 94.8795 159.085C94.7798 159.038 94.698 158.978 94.6342 158.906C94.5705 158.833 94.5218 158.76 94.4881 158.685H94.4655V160.115H93.7245ZM94.4499 157.777C94.4499 157.936 94.4719 158.075 94.516 158.193C94.56 158.311 94.6238 158.404 94.7073 158.47C94.7908 158.535 94.8923 158.567 95.0117 158.567C95.1323 158.567 95.2344 158.534 95.3179 158.468C95.4014 158.401 95.4646 158.308 95.5075 158.19C95.5515 158.07 95.5736 157.933 95.5736 157.777C95.5736 157.623 95.5521 157.487 95.5092 157.37C95.4663 157.253 95.4031 157.162 95.3196 157.095C95.2361 157.029 95.1335 156.996 95.0117 156.996C94.8911 156.996 94.7891 157.028 94.7056 157.092C94.6232 157.156 94.56 157.246 94.516 157.363C94.4719 157.48 94.4499 157.618 94.4499 157.777ZM97.5653 157.569V159.113H96.8242V155.551H97.5444V156.913H97.5757C97.636 156.755 97.7334 156.632 97.8679 156.542C98.0025 156.452 98.1712 156.407 98.3741 156.407C98.5597 156.407 98.7214 156.447 98.8594 156.528C98.9986 156.608 99.1064 156.724 99.183 156.875C99.2607 157.024 99.2989 157.203 99.2978 157.412V159.113H98.5568V157.544C98.5579 157.38 98.5162 157.251 98.4315 157.16C98.348 157.068 98.2309 157.022 98.0802 157.022C97.9793 157.022 97.89 157.044 97.8123 157.087C97.7357 157.13 97.6754 157.192 97.6314 157.275C97.5885 157.356 97.5664 157.454 97.5653 157.569Z" fill="white" fillOpacity="0.57" />
            <defs>
              <filter id="filter0_f_318_5" x="10.1315" y="9.58072" width="168.659" height="154.676" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                <feGaussianBlur stdDeviation="2.54167" result="effect1_foregroundBlur_318_5" />
              </filter>
              <filter id="filter1_f_318_5" x="8.177" y="5.46801" width="169.392" height="160.767" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                <feGaussianBlur stdDeviation="1.54041" result="effect1_foregroundBlur_318_5" />
              </filter>
              <filter id="filter2_f_318_5" x="8.177" y="5.46801" width="169.392" height="160.767" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                <feGaussianBlur stdDeviation="1.54041" result="effect1_foregroundBlur_318_5" />
              </filter>
              <filter id="filter3_f_318_5" x="8.177" y="5.46801" width="169.392" height="160.767" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                <feGaussianBlur stdDeviation="1.54041" result="effect1_foregroundBlur_318_5" />
              </filter>
              <linearGradient id="paint0_linear_318_5" x1="114.378" y1="70.9346" x2="17.3328" y2="76.326" gradientUnits="userSpaceOnUse">
                <stop stopColor="white" />
                <stop offset="1" stopColor="#999999" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      <div className="absolute inset-0 z-0 flex items-center justify-center">
        {isVehCar ? (
          <div className="absolute m-auto z-10">
            <div className="flex items-end justify-start gap-8 w-40">
              <div className="flex gap-0.5">
                <div className="flex flex-col items-start justify-center gap-1 w-full">
                  <h1 className="text-white font-bold" style={{ fontSize: "33px" }}>
                    {formatSpeed(veh.speed)}
                  </h1>
                  <hr className="border-white w-full -mt-2.5" />
                </div>
                <div className="flex flex-col gap-1 w-full justify-end">
                  <h1 className="text-white font-medium text-9">{veh.kmH ? "KMH" : "MPH"}</h1>
                  <hr className="border-white w-full" />
                </div>
              </div>
              <div className="flex flex-col items-end justify-center gap-1 w-full">
                <h1 className="text-white font-bold" style={{ fontSize: "23px" }}>
                  {veh.fuel.level}
                  <span className="text-sm">%</span>
                </h1>
                <hr className="w-full -mt-2" />
              </div>
            </div>
          </div>
        ) : (
          <div className="absolute m-auto z-10 bottom-5">
            <div className="flex items-end gap-8 w-40">
              <div className="flex gap-0.5">
                <div className="flex flex-col items-start justify-center gap-1 w-full">
                  <h1 className="text-white font-bold" style={{ fontSize: "33px" }}>
                    {formatSpeed(veh.speed)}
                  </h1>
                  <hr className="border-white w-full -mt-2.5" />
                </div>
                <div className="flex flex-col gap-1 w-full justify-end">
                  <h1 className="text-white font-medium text-9">{veh.kmH ? "KMH" : "MPH"}</h1>
                  <hr className="border-white w-full" />
                </div>
              </div>
              <div className="flex flex-col items-end justify-end gap-1 w-full">
                <h1 className="text-white font-bold" style={{ fontSize: "23px" }}>
                  {veh.fuel.level}
                  <span className="text-sm">%</span>
                </h1>
                <hr className="w-full -mt-2" />
              </div>
            </div>
          </div>
        )}

        <img src="images/vehicle_hud/bmg_black_bg.svg" alt="bmg_black_bg" />

        {isVehPlane && (
          <img
            className="absolute overflow-hidden z-10"
            src="images/vehicle_hud/bmg_plane_bg.svg"
            alt="bmg_plane_bg"
          />
        )}

        {isVehBoat && (
          <img
            className="absolute overflow-hidden transition-transform duration-75 z-10"
            style={{
              transform: `rotate(${heading}deg)`,
              transformOrigin: "center",
            }}
            src="images/vehicle_hud/bmg_boat_bg.svg"
            alt="bmg_boat_bg"
          />
        )}

        {isVehCar && (
          <div className="absolute bottom-1 flex items-center justify-center gap-5 mb-2">
            <img
              width={16}
              src="images/icons/vehicle_spot.svg"
              alt="vehicle_spot"
              style={{ opacity: veh.isLightOn ? 1 : 0.5 }}
            />
            <SeatbeltIcon
              width={16}
              enabled={veh.isSeatbeltOn}
              enabledOpacity={1}
              disabledOpacity={0.5}
            />
          </div>
        )}
      </div>
          <MileagePill
        mileage={mileage}
        mileageUnit={mileageUnit}
        accent="#ff2f67"
        style={{ right: 78, bottom: 14 }}
      />
</div>
  );
};

export default Bmg;