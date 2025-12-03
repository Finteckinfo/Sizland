import { useSprings, animated } from '@react-spring/web';
import { useEffect, useRef, useState } from 'react';
import AuroraText from "./aurora-text";

interface SplitTextProps {
    text?: string;
    className?: string;
    delay?: number;
    animationFrom?: { opacity: number; transform: string };
    animationTo?: { opacity: number; transform: string };
    easing?: (t: number) => number;
    threshold?: number;
    rootMargin?: string;
    textAlign?: 'left' | 'right' | 'center' | 'justify' | 'initial' | 'inherit';
    onLetterAnimationComplete?: () => void;
}

const SplitText: React.FC<SplitTextProps> = ({
    text = '',
    className = '',
    delay = 100,
    animationFrom = { opacity: 0, transform: 'translate3d(0,40px,0)' },
    animationTo = { opacity: 1, transform: 'translate3d(0,0,0)' },
    easing = (t: number) => t,
    threshold = 0.1,
    rootMargin = '-100px',
    textAlign = 'center',
    onLetterAnimationComplete,
}) => {
    const words = text.split(' ').map(word => word.split(''));
    const letters = words.flat();

    // Find where the trailing "ow." of "Grow." starts so we can wrap it with AuroraText
    const joined = letters.join('');
    const pattern = 'ow.';
    const auroraStartIndex = joined.lastIndexOf(pattern);
    const auroraEndIndex = auroraStartIndex === -1 ? -1 : auroraStartIndex + pattern.length;
    const [inView, setInView] = useState(false);
    const ref = useRef<HTMLParagraphElement>(null);
    const animatedCount = useRef(0);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    if (ref.current) {
                        observer.unobserve(ref.current);
                    }
                }
            },
            { threshold, rootMargin }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, [threshold, rootMargin]);

    const springs = useSprings(
        letters.length,
        letters.map((_, i) => ({
            from: animationFrom,
            to: inView
                ? async (next: (props: any) => Promise<void>) => {
                    await next(animationTo);
                    animatedCount.current += 1;
                    if (animatedCount.current === letters.length && onLetterAnimationComplete) {
                        onLetterAnimationComplete();
                    }
                }
                : animationFrom,
            delay: i * delay,
            config: { easing },
        }))
    );

    return (
        <p
            ref={ref}
            className={`split-parent ${className}`}
            style={{ textAlign, overflow: 'hidden', display: 'inline', whiteSpace: 'normal', wordWrap: 'break-word' }}
        >
            {words.map((word, wordIndex) => (
                <span key={wordIndex} style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
                    {word.map((letter, letterIndex) => {
                        const globalIndex = words
                            .slice(0, wordIndex)
                            .reduce((acc, w) => acc + w.length, 0) + letterIndex;

                        const isAurora =
                            auroraStartIndex !== -1 &&
                            globalIndex >= auroraStartIndex &&
                            globalIndex < auroraEndIndex;

                        return (
                            <animated.span
                                key={globalIndex}
                                style={{
                                    ...springs[globalIndex],
                                    display: 'inline-block',
                                    willChange: 'transform, opacity',
                                }}
                            >
                                {isAurora ? (
                                    <AuroraText className="inline-block">
                                        {letter}
                                    </AuroraText>
                                ) : (
                                    letter
                                )}
                            </animated.span>
                        );
                    })}
                    <span style={{ display: 'inline-block', width: '0.3em' }}>&nbsp;</span>
                </span>
            ))}
        </p>
    );
};

export default SplitText;