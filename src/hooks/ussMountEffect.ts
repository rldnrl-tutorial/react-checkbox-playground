/* eslint-disable react-hooks/exhaustive-deps */
import { EffectCallback, useEffect } from "react";

const useMountEffect = (effectFn: EffectCallback) => useEffect(effectFn, []);

export default useMountEffect;
