export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface LandmarkHistoryItem {
  time: number;
  landmarks: Point3D[];
}

export class MediaPipeASLClassifier {
  dist(p1: Point3D, p2: Point3D): number {
    return Math.sqrt(
      Math.pow(p1.x - p2.x, 2) +
        Math.pow(p1.y - p2.y, 2) +
        Math.pow(p1.z - p2.z, 2)
    );
  }

  // -------------------------------------------------------------
  // 1. 双手 "NAME" 识别算法 (Two-Handed NAME Only!)
  // -------------------------------------------------------------
  detectTwoHandPhrase(multiHandLandmarks: Point3D[][]): string | null {
    if (!multiHandLandmarks || multiHandLandmarks.length < 2) return null;

    const hand1 = multiHandLandmarks[0];
    const hand2 = multiHandLandmarks[1];

    if (!hand1 || hand1.length < 21 || !hand2 || hand2.length < 21) return null;

    const wrist1 = hand1[0], wrist2 = hand2[0];
    const indexTip1 = hand1[8], indexTip2 = hand2[8];
    const middleMCP1 = hand1[9], middleMCP2 = hand2[9];

    if (wrist1.y < 0.20 || wrist2.y < 0.20 || wrist1.y > 0.92 || wrist2.y > 0.92) return null;

    const distBetweenWrists = Math.sqrt(Math.pow(wrist1.x - wrist2.x, 2) + Math.pow(wrist1.y - wrist2.y, 2));
    const distHandOverlap = Math.sqrt(Math.pow(indexTip1.x - indexTip2.x, 2) + Math.pow(indexTip1.y - indexTip2.y, 2));
    const distCrossOverlap = Math.sqrt(Math.pow(indexTip1.x - middleMCP2.x, 2) + Math.pow(indexTip1.y - middleMCP2.y, 2));

    if (distBetweenWrists < 0.50 || distHandOverlap < 0.38 || distCrossOverlap < 0.38) {
      const handScale1 = Math.max(this.dist(wrist1, middleMCP1), 0.05);
      const handScale2 = Math.max(this.dist(wrist2, middleMCP2), 0.05);

      const extIndex1 = this.dist(indexTip1, wrist1) / handScale1;
      const extPinky1 = this.dist(hand1[20], wrist1) / handScale1;
      const extIndex2 = this.dist(indexTip2, wrist2) / handScale2;
      const extPinky2 = this.dist(hand2[20], wrist2) / handScale2;

      if (extIndex1 > extPinky1 * 0.95 && extIndex2 > extPinky2 * 0.95) {
        return "NAME";
      }
    }

    return null;
  }

  // -------------------------------------------------------------
  // 2. 单手短语识别算法 (HELLO / THANK YOU / MY)
  // -------------------------------------------------------------
  detectPhrase(rawLandmarks: Point3D[], history: LandmarkHistoryItem[] = []): string | null {
    if (!rawLandmarks || rawLandmarks.length < 21) return null;

    const wrist = rawLandmarks[0];
    const thumbTip = rawLandmarks[4];
    const indexTip = rawLandmarks[8], indexMCP = rawLandmarks[5];
    const middleTip = rawLandmarks[12], middleMCP = rawLandmarks[9];
    const ringTip = rawLandmarks[16], pinkyTip = rawLandmarks[20];

    const handScale = Math.max(
      Math.sqrt(Math.pow(wrist.x - middleMCP.x, 2) + Math.pow(wrist.y - middleMCP.y, 2)),
      0.05
    );

    const extIndex = Math.sqrt(Math.pow(indexTip.x - wrist.x, 2) + Math.pow(indexTip.y - wrist.y, 2)) / handScale;
    const extMiddle = Math.sqrt(Math.pow(middleTip.x - wrist.x, 2) + Math.pow(middleTip.y - wrist.y, 2)) / handScale;
    const extRing = Math.sqrt(Math.pow(ringTip.x - wrist.x, 2) + Math.pow(ringTip.y - wrist.y, 2)) / handScale;
    const extPinky = Math.sqrt(Math.pow(pinkyTip.x - wrist.x, 2) + Math.pow(pinkyTip.y - wrist.y, 2)) / handScale;

    const normThumbIndex = Math.sqrt(Math.pow(thumbTip.x - indexTip.x, 2) + Math.pow(thumbTip.y - indexTip.y, 2)) / handScale;

    // 拦截 C 弧形弯曲手型 -> 直通字母分类器
    const indexCurvature = this.dist(indexTip, indexMCP) / handScale;
    const isCHandshapePattern = indexCurvature < 0.74 && normThumbIndex >= 0.28 && normThumbIndex <= 1.25;

    if (isCHandshapePattern) {
      return null;
    }

    const isFlatOpenHand =
      indexCurvature >= 0.74 &&
      extIndex > 1.20 &&
      extMiddle > 1.20 &&
      extRing > 1.12 &&
      extPinky > 1.02 &&
      normThumbIndex > 0.38 &&
      indexTip.y < wrist.y + 0.05 * handScale;

    // A. "THANK YOU" (起于嘴唇/下巴，向下方/前方延伸)
    if (isFlatOpenHand && history && history.length >= 2) {
      const oldest = history[0].landmarks;
      if (oldest && oldest[8]) {
        const deltaY = indexTip.y - oldest[8].y;
        const deltaX = indexTip.x - oldest[8].x;
        if (oldest[8].y >= 0.35 && deltaY > 0.040 && deltaY > Math.abs(deltaX) * 0.8) {
          return "THANK YOU";
        }
      }
    }

    // B. "HELLO" (高举于太阳穴/额头高位：wrist.y < 0.50 或 indexTip.y < 0.38)
    if (isFlatOpenHand && (indexTip.y < 0.38 || wrist.y < 0.50)) {
      if (history && history.length >= 2) {
        const oldest = history[0].landmarks;
        if (oldest && oldest[8]) {
          const deltaY = indexTip.y - oldest[8].y;
          if (oldest[8].y >= 0.38 && deltaY > 0.040) {
            return "THANK YOU";
          }
        }
      }
      return "HELLO";
    }

    // C. "MY" (胸前位置：wrist.y >= 0.50 且呈斜向上姿态)
    // 强制要求位于中胸高度 (wrist.y >= 0.50)，严禁在太阳穴/头部高位 (wrist.y < 0.50) 触发 MY！
    const dy = wrist.y - middleTip.y;
    const dx = Math.abs(middleTip.x - wrist.x);
    const isDiagonallyUpward = dy > 0.08 * handScale && dx >= 0.45 * dy;
    const isChestHeight = wrist.y >= 0.50 && wrist.y <= 0.90;

    if (isFlatOpenHand && isDiagonallyUpward && isChestHeight) {
      return "MY";
    }

    return null;
  }

  classifyLandmarks(
    rawLandmarks: Point3D[],
    isRearCamera = false,
    history: LandmarkHistoryItem[] = [],
    videoWidth = 1280,
    videoHeight = 720,
    multiHandLandmarks: Point3D[][] = []
  ): string {
    if (multiHandLandmarks && multiHandLandmarks.length >= 2) {
      const twoHandPhrase = this.detectTwoHandPhrase(multiHandLandmarks);
      if (twoHandPhrase) return twoHandPhrase;
    }

    if (!rawLandmarks || rawLandmarks.length < 21) return 'A';

    const phrase = this.detectPhrase(rawLandmarks, history);
    if (phrase) return phrase;

    const isMobile =
      typeof window !== 'undefined' &&
      (/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || window.innerWidth <= 768);

    if (!isMobile) {
      const isMirroredHand = rawLandmarks[2].x > rawLandmarks[17].x;
      const landmarks = isMirroredHand
        ? rawLandmarks.map((p) => ({ x: 1.0 - p.x, y: p.y, z: p.z }))
        : rawLandmarks;
      return this.classifyDesktopLandmarks(landmarks, history);
    }

    return this.classifyMobileLandmarks(rawLandmarks, isRearCamera, history, videoWidth, videoHeight);
  }

  classifyDesktopLandmarks(landmarks: Point3D[], history: LandmarkHistoryItem[] = []): string {
    const wrist = landmarks[0];
    const thumbTip = landmarks[4], thumbIP = landmarks[3];
    const indexTip = landmarks[8], indexDIP = landmarks[7], indexPIP = landmarks[6], indexMCP = landmarks[5];
    const middleTip = landmarks[12], middlePIP = landmarks[10], middleMCP = landmarks[9];
    const ringTip = landmarks[16], ringPIP = landmarks[14], ringMCP = landmarks[13];
    const pinkyTip = landmarks[20], pinkyMCP = landmarks[17];

    const handScale = Math.max(this.dist(wrist, middleMCP), 0.05);

    const extIndex = this.dist(indexTip, wrist) / handScale;
    const extMiddle = this.dist(middleTip, wrist) / handScale;
    const extRing = this.dist(ringTip, wrist) / handScale;
    const extPinky = this.dist(pinkyTip, wrist) / handScale;
    const extThumb = this.dist(thumbTip, wrist) / handScale;

    const isIndexStraight = extIndex > 1.20;
    const isMiddleStraight = extMiddle > 1.20;
    const isRingStraight = extRing > 1.12;
    const isPinkyStraight = extPinky > 1.02;

    const isIndexOpen = extIndex > 0.98;
    const isRingOpen = extRing > 0.98;
    const isPinkyOpen = extPinky > 0.92;

    const normThumbIndex = this.dist(thumbTip, indexTip) / handScale;
    const normThumbMiddle = this.dist(thumbTip, middleTip) / handScale;
    const normThumbPinky = this.dist(thumbTip, pinkyTip) / handScale;

    const isMiddleExtendedAlongsideIndex = (extMiddle > 1.08) && (extMiddle >= extIndex * 0.82);

    const dyUp = wrist.y - middleTip.y;
    const dxUp = Math.abs(middleTip.x - wrist.x);
    const isPointingStraightUpB = dyUp > 0.10 * handScale && dxUp < 0.42 * dyUp && isIndexStraight && isMiddleStraight && isRingStraight && isPinkyStraight;

    const isPointingDown = indexTip.y > indexMCP.y + 0.15 * handScale;

    const dxHoriz = Math.abs(indexTip.x - indexMCP.x);
    const dyHoriz = Math.abs(indexTip.y - indexMCP.y);
    const isHorizontal = !isPointingDown && dxHoriz > dyHoriz * 1.1;

    const isCrossed = (indexTip.x > middleTip.x && indexMCP.x < middleMCP.x) || (indexTip.x < middleTip.x && indexMCP.x > middleMCP.x);

    let detected = 'A';

    if (isCrossed && isIndexOpen && isMiddleExtendedAlongsideIndex && !isRingOpen && !isPinkyOpen) {
      detected = 'R';
    } else if (isPointingStraightUpB) {
      if (normThumbIndex < 0.32 && normThumbMiddle < 0.35) detected = 'O';
      else detected = 'B';
    } else if (isPointingDown && isIndexOpen) {
      if (isMiddleExtendedAlongsideIndex) detected = 'P';
      else detected = 'Q';
    } else if (isHorizontal && isIndexOpen && !isRingOpen && !isPinkyOpen) {
      if (isMiddleExtendedAlongsideIndex) detected = 'H';
      else detected = 'G';
    } else if (
      !isPointingDown &&
      normThumbIndex >= 0.25 && normThumbIndex <= 1.28 &&
      extThumb > 0.50 &&
      extIndex >= 0.75
    ) {
      detected = 'C';
    } else if (extIndex < 0.98 && extMiddle < 0.98 && extRing < 0.98 && extPinky < 0.98) {
      const distThumbIndexPIP = this.dist(thumbTip, indexPIP) / handScale;
      const distThumbMiddlePIP = this.dist(thumbTip, middlePIP) / handScale;
      const distThumbRingPIP = this.dist(thumbTip, ringPIP) / handScale;

      const distThumbIndexMCP = this.dist(thumbTip, indexMCP) / handScale;
      const distThumbMiddleMCP = this.dist(thumbTip, middleMCP) / handScale;
      const distThumbRingMCP = this.dist(thumbTip, ringMCP) / handScale;
      const distThumbPinkyMCP = this.dist(thumbTip, pinkyMCP) / handScale;

      if (distThumbMiddlePIP < 0.32 && distThumbIndexPIP < 0.36 && Math.abs(thumbTip.y - thumbIP.y) < 0.16 * handScale && thumbTip.z <= indexPIP.z + 0.02) {
        detected = 'S';
      } else if (normThumbIndex < 0.22 && normThumbMiddle < 0.22 && extIndex >= 0.85) {
        detected = 'E';
      } else if (distThumbPinkyMCP < 0.34 || (distThumbPinkyMCP < distThumbMiddleMCP && distThumbRingMCP < 0.32)) {
        detected = 'M';
      } else if (distThumbRingMCP < 0.32 && distThumbMiddleMCP < distPinkyMCP) {
        detected = 'N';
      } else if (distThumbMiddleMCP < 0.34 && distThumbIndexMCP < distRingMCP) {
        detected = 'T';
      } else {
        detected = 'A';
      }
    } else if (isIndexOpen && isMiddleExtendedAlongsideIndex && isRingOpen && !isPinkyOpen) {
      detected = 'W';
    } else if (!isIndexOpen && isMiddleExtendedAlongsideIndex && isRingOpen && isPinkyOpen && normThumbIndex < 0.4) {
      detected = 'F';
    } else if (extIndex >= 1.02 && isIndexHooked && !isMiddleExtendedAlongsideIndex && !isRingOpen && !isPinkyOpen) {
      detected = 'X';
    } else if (!isIndexOpen && !isMiddleExtendedAlongsideIndex && !isRingOpen && isPinkyOpen) {
      const isThumbOutY = (normThumbIndex > 0.42 || normThumbMiddle > 0.42) && normThumbPinky > 0.55 && extThumb > 0.65;
      const isJTracingMotion = pinkyDisplacementX > 0.06 && pinkyDisplacementY > 0.06 && pinkyDisplacementX + pinkyDisplacementY > 0.12;

      if (isThumbOutY) {
        detected = 'Y';
      } else if (isJTracingMotion) {
        detected = 'J';
      } else {
        detected = 'I';
      }
    } else if (isIndexOpen && !isMiddleExtendedAlongsideIndex && !isRingOpen && !isPinkyOpen && extThumb > 0.88 && normThumbIndex > 0.58 && normThumbMiddle > 0.48) {
      const isZTracingMotion = indexDisplacementX > 0.06 && indexDisplacementY > 0.06 && indexDisplacementX + indexDisplacementY > 0.12;
      if (isZTracingMotion) {
        detected = 'Z';
      } else {
        detected = 'L';
      }
    } else if (isIndexOpen && !isMiddleExtendedAlongsideIndex && !isRingOpen && !isPinkyOpen) {
      const isZTracingMotion = indexDisplacementX > 0.06 && indexDisplacementY > 0.06 && indexDisplacementX + indexDisplacementY > 0.12;
      if (isZTracingMotion) {
        detected = 'Z';
      } else {
        detected = 'D';
      }
    }

    return detected;
  }

  classifyMobileLandmarks(
    rawLandmarks: Point3D[],
    isRearCamera = false,
    history: LandmarkHistoryItem[] = [],
    videoWidth = 720,
    videoHeight = 1280
  ): string {
    if (!rawLandmarks || rawLandmarks.length < 21) return 'A';

    const needsMirroring = isRearCamera
      ? rawLandmarks[2].x < rawLandmarks[17].x
      : rawLandmarks[2].x > rawLandmarks[17].x;

    const normalizedLandmarks = needsMirroring
      ? rawLandmarks.map((p) => ({ x: 1.0 - p.x, y: p.y, z: p.z }))
      : rawLandmarks;

    const aspect = videoWidth > 0 && videoHeight > 0 ? videoWidth / videoHeight : 0.5625;
    const landmarks = normalizedLandmarks.map((p) => ({
      x: p.x * aspect,
      y: p.y,
      z: p.z * aspect,
    }));

    const wrist = landmarks[0];
    const thumbTip = landmarks[4], thumbIP = landmarks[3];
    const indexTip = landmarks[8], indexDIP = landmarks[7], indexPIP = landmarks[6], indexMCP = landmarks[5];
    const middleTip = landmarks[12], middleDIP = landmarks[11], middlePIP = landmarks[10], middleMCP = landmarks[9];
    const ringTip = landmarks[16], ringDIP = landmarks[15], ringPIP = landmarks[14], ringMCP = landmarks[13];
    const pinkyTip = landmarks[20], pinkyDIP = landmarks[19], pinkyPIP = landmarks[18], pinkyMCP = landmarks[17];

    const handScale = Math.max(this.dist(wrist, middleMCP), 0.05);

    const extIndex = this.dist(indexTip, wrist) / handScale;
    const extMiddle = this.dist(middleTip, wrist) / handScale;
    const extRing = this.dist(ringTip, wrist) / handScale;
    const extPinky = this.dist(pinkyTip, wrist) / handScale;
    const extThumb = this.dist(thumbTip, wrist) / handScale;

    const isIndexStraight = extIndex > 1.22;
    const isMiddleStraight = extMiddle > 1.22;
    const isRingStraight = extRing > 1.15;
    const isPinkyStraight = extPinky > 1.05;

    const isIndexOpen = extIndex > 0.98;
    const isRingOpen = extRing > 0.98;
    const isPinkyOpen = extPinky > 0.92;

    const normThumbIndex = this.dist(thumbTip, indexTip) / handScale;
    const normThumbMiddle = this.dist(thumbTip, middleTip) / handScale;
    const normThumbPinky = this.dist(thumbTip, pinkyTip) / handScale;

    const isMiddleExtendedAlongsideIndex = (extMiddle > 1.08) && (extMiddle >= extIndex * 0.82);

    const dyUp = wrist.y - middleTip.y;
    const dxUp = Math.abs(middleTip.x - wrist.x);
    const isPointingStraightUpB = dyUp > 0.10 * handScale && dxUp < 0.42 * dyUp && isIndexStraight && isMiddleStraight && isRingStraight && isPinkyStraight;

    const isPointingDown = indexTip.y > indexMCP.y + 0.15 * handScale;

    const dxHoriz = Math.abs(indexTip.x - indexMCP.x);
    const dyHoriz = Math.abs(indexTip.y - indexMCP.y);
    const isHorizontal = !isPointingDown && dxHoriz > dyHoriz * 1.1;

    const isCrossed = (indexTip.x > middleTip.x && indexMCP.x < middleMCP.x) || (indexTip.x < middleTip.x && indexMCP.x > middleMCP.x);

    let indexDisplacementX = 0, indexDisplacementY = 0;
    let pinkyDisplacementX = 0, pinkyDisplacementY = 0;

    if (history && history.length >= 2) {
      const oldest = history[0].landmarks;
      if (oldest && oldest.length >= 21) {
        indexDisplacementX = Math.abs(indexTip.x - oldest[8].x);
        indexDisplacementY = Math.abs(indexTip.y - oldest[8].y);
        pinkyDisplacementX = Math.abs(pinkyTip.x - oldest[20].x);
        pinkyDisplacementY = Math.abs(pinkyTip.y - oldest[20].y);
      }
    }

    let detected = 'A';

    if (isCrossed && isIndexOpen && isMiddleExtendedAlongsideIndex && !isRingOpen && !isPinkyOpen) {
      detected = 'R';
    } else if (isPointingStraightUpB) {
      if (normThumbIndex < 0.32 && normThumbMiddle < 0.35) detected = 'O';
      else detected = 'B';
    } else if (isPointingDown && isIndexOpen) {
      if (isMiddleExtendedAlongsideIndex) detected = 'P';
      else detected = 'Q';
    } else if (isHorizontal && isIndexOpen && !isRingOpen && !isPinkyOpen) {
      if (isMiddleExtendedAlongsideIndex) detected = 'H';
      else detected = 'G';
    } else if (
      !isPointingDown &&
      normThumbIndex >= 0.25 && normThumbIndex <= 1.28 &&
      extThumb > 0.50 &&
      extIndex >= 0.75
    ) {
      detected = 'C';
    } else if (extIndex < 0.98 && extMiddle < 0.98 && extRing < 0.98 && extPinky < 0.98) {
      const distThumbIndexPIP = this.dist(thumbTip, indexPIP) / handScale;
      const distThumbMiddlePIP = this.dist(thumbTip, middlePIP) / handScale;
      const distThumbRingPIP = this.dist(thumbTip, ringPIP) / handScale;

      const distThumbIndexMCP = this.dist(thumbTip, indexMCP) / handScale;
      const distThumbMiddleMCP = this.dist(thumbTip, middleMCP) / handScale;
      const distThumbRingMCP = this.dist(thumbTip, ringMCP) / handScale;
      const distThumbPinkyMCP = this.dist(thumbTip, pinkyMCP) / handScale;

      if (distThumbMiddlePIP < 0.42 && distThumbIndexPIP < 0.42 && Math.abs(thumbTip.y - thumbIP.y) < 0.22 * handScale) {
        detected = 'S';
      } else if (normThumbIndex < 0.46 && normThumbMiddle < 0.46 && extIndex < 0.96 && extMiddle < 0.96) {
        detected = 'E';
      } else if (distThumbPinkyMCP < 0.42 || (distThumbPinkyMCP < distThumbMiddleMCP && distThumbRingMCP < 0.40)) {
        detected = 'M';
      } else if (distThumbRingMCP < 0.40 && distThumbMiddleMCP < distPinkyMCP) {
        detected = 'N';
      } else if (distThumbIndexMCP < 0.44 || (distThumbMiddleMCP < 0.44 && distThumbIndexMCP < distRingMCP)) {
        detected = 'T';
      } else {
        detected = 'A';
      }
    } else if (isIndexOpen && isMiddleExtendedAlongsideIndex && isRingOpen && !isPinkyOpen) {
      detected = 'W';
    } else if (!isIndexOpen && isMiddleExtendedAlongsideIndex && isRingOpen && isPinkyOpen && normThumbIndex < 0.4) {
      detected = 'F';
    } else if (extIndex >= 1.02 && isIndexHooked && !isMiddleExtendedAlongsideIndex && !isRingOpen && !isPinkyOpen) {
      detected = 'X';
    } else if (!isIndexOpen && !isMiddleExtendedAlongsideIndex && !isRingOpen && isPinkyOpen) {
      const isThumbOutY = (normThumbIndex > 0.42 || normThumbMiddle > 0.42) && normThumbPinky > 0.55 && extThumb > 0.65;
      const isJTracingMotion = pinkyDisplacementX > 0.06 && pinkyDisplacementY > 0.06 && pinkyDisplacementX + pinkyDisplacementY > 0.12;

      if (isThumbOutY) {
        detected = 'Y';
      } else if (isJTracingMotion) {
        detected = 'J';
      } else {
        detected = 'I';
      }
    } else if (isIndexOpen && !isMiddleExtendedAlongsideIndex && !isRingOpen && !isPinkyOpen && extThumb > 0.88 && normThumbIndex > 0.58 && normThumbMiddle > 0.48) {
      const isZTracingMotion = indexDisplacementX > 0.06 && indexDisplacementY > 0.06 && indexDisplacementX + indexDisplacementY > 0.12;
      if (isZTracingMotion) {
        detected = 'Z';
      } else {
        detected = 'L';
      }
    } else if (isIndexOpen && !isMiddleExtendedAlongsideIndex && !isRingOpen && !isPinkyOpen) {
      const isZTracingMotion = indexDisplacementX > 0.06 && indexDisplacementY > 0.06 && indexDisplacementX + indexDisplacementY > 0.12;
      if (isZTracingMotion) {
        detected = 'Z';
      } else {
        detected = 'D';
      }
    }

    return detected;
  }
}

export class TTSEngine {
  private isMuted: boolean = false;

  speak(text: string, lang = 'en-US') {
    if (this.isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('TTS Synthesis error:', e);
    }
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}
