'use client';

import React, { useEffect, useState, useRef } from 'react';
import styles from '@/utils/css/page.module.css'
import { rotationType } from '@/utils/types'
import { useRefContext } from '@/utils/hooks';
import { motion, animate, transform, useMotionValue, useSpring } from 'motion/react';

function FollowNode({overlayStyles}: {overlayStyles?: string}) {
    
    const stickyElements = useRefContext();
    const cursorRef = useRef<any>(undefined);
    const lastStickyTarget = useRef<any>(undefined);
    const [hoveredState, setHoveredState] = useState<boolean>(false);
    const [isTargetLarge, setIsTargetLarge] = useState<boolean>(false);
    const cursorSize = {
        w: hoveredState ? (lastStickyTarget.current? (
            lastStickyTarget.current?.clientWidth < 200 ? lastStickyTarget.current?.clientWidth : 60
        ) + 20 : 60) : 20,
        
        h: hoveredState ? (lastStickyTarget.current? (
            lastStickyTarget.current?.clientHeight < 200 ? lastStickyTarget.current?.clientHeight : 60
        ) + 20 : 60) : 20,
    };

    const mouse = {
        x: useMotionValue(0),
        y: useMotionValue(0),
    }

    const smoothAnimateMouseConfig = {
        damping: 20,
        stiffness: 300,
        mass: 0.5,
    }

    const smoothAnimateMouse = {
        x: useSpring(mouse.x, smoothAnimateMouseConfig),
        y: useSpring(mouse.y, smoothAnimateMouseConfig),
    }

    const scale = {
        x: useMotionValue(1),
        y: useMotionValue(1),
    }

    function getTargetElement (targetID: any): any {
        
        const element = stickyElements.current.find((element: any) => element.id === targetID);
        
        if (!element && stickyElements) {

            return lastStickyTarget.current? lastStickyTarget.current : stickyElements.current[0];
        }

        lastStickyTarget.current = element;
        console.log(`last target: ${lastStickyTarget.current.id}\n new target: ${element.id}`);
        return element;
    }

    function manageMouseMove(e: any) {
        const {clientX, clientY} = e;
        const stickyTarget = getTargetElement(e.target.id);
        const { left, top, width, height } = stickyTarget.getBoundingClientRect();
        const centerPoint = {x: left + width / 2, y: top + height / 2};
        const distanceFrom = {x: clientX - centerPoint.x, y: clientY - centerPoint.y};

        if (hoveredState) {
            if (!isTargetLarge){
                rotate(distanceFrom);
            }
            const absDistance = Math.max(Math.abs(distanceFrom.x), Math.abs(distanceFrom.y));
            const newScaleX = transform(absDistance, [0, height/2], [1, 1.3]);
            const newScaleY = transform(absDistance, [0, width/2], [1, 0.8]);
        
            scale.x.set(newScaleX);
            scale.y.set(newScaleY);
            mouse.x.set((centerPoint.x - cursorSize.w / 2) + distanceFrom.x * 0.1);
            mouse.y.set((centerPoint.y - cursorSize.h / 2) + distanceFrom.y * 0.1);
        } else {
            mouse.x.set(clientX - cursorSize.h / 2);
            mouse.y.set(clientY - cursorSize.w / 2);
        }
    }

    function manageMouseOver() {
        setHoveredState(true);
        if(lastStickyTarget.current && (lastStickyTarget.current.clientWidth > 130)){
            const diff:number = Math.abs(lastStickyTarget.current.clientWidth - lastStickyTarget.current.clientHeight);
            if(diff > 20){
                setIsTargetLarge(true);
            }
        }
        animate(cursorRef.current, { rotate: `${0}rad` }, {duration: 0})
    }

    function manageMouseLeave(){
        setHoveredState(false);
        setIsTargetLarge(false);
        animate(cursorRef.current, { scaleX: 1, scaleY: 1 }, {duration: 0.1, type: "spring" });
    }

    function rotate(distance:{x:number, y:number}) {
        const angle = Math.atan2(distance.y, distance.x);
        animate(cursorRef.current, { rotate: `${angle}rad` }, {duration: 0})
    }

    function template ({rotate, scaleX, scaleY}: rotationType) {
        return `rotate(${rotate}) scaleX(${scaleX}) scaleY(${scaleY})`;
    }

    useEffect(()=>{
        const stickyElementNodes = stickyElements.current;

        if(stickyElementNodes){

            window.addEventListener("mousemove", manageMouseMove);
            //stickyElementNode.addEventListener("mouseover", manageMouseOver);
            //stickyElementNode.addEventListener("mouseleave", manageMouseLeave);
            stickyElementNodes.forEach((node: any)=>{
                node.addEventListener("mouseover", manageMouseOver);
                node.addEventListener("mouseleave", manageMouseLeave);
            });
            return () => {
                window.removeEventListener("mousemove", manageMouseMove);
                //stickyElementNode.removeEventListener("mouseover", manageMouseOver);
                //stickyElementNode.removeEventListener("mouseleave", manageMouseLeave);
                stickyElementNodes.forEach((node: any)=>{
                    node.removeEventListener("mouseover", manageMouseOver);
                    node.removeEventListener("mouseleave", manageMouseLeave);
                });
            }
        }
    });

    return (
        <motion.div
        transformTemplate={template}
        className={`${styles.cursor} ${overlayStyles}`}
        ref={cursorRef}
        style={{
            left: smoothAnimateMouse.x,
            top:smoothAnimateMouse.y,
            scaleX: scale.x,
            scaleY: scale.y,
        }}
        animate={{width: cursorSize.w, height: cursorSize.h}}
        >

        </motion.div>
    );
}

export default FollowNode;