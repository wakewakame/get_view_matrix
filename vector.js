function vvec(x, y, z, w = 1) { return {x: x, y: y, z: z, w: w}; }
function vcopy(vec) { return vvec(vec.x, vec.y, vec.z, vec.w); }
function vadd(vec1, vec2) { return vvec(vec1.x + vec2.x, vec1.y + vec2.y, vec1.z + vec2.z, (vec1.w + vec2.w) / 2); }
function vsub(vec1, vec2) { return vvec(vec1.x - vec2.x, vec1.y - vec2.y, vec1.z - vec2.z, (vec1.w + vec2.w) / 2); }
function vdot(vec1, vec2) { return vec1.x * vec2.x + vec1.y * vec2.y + vec1.z * vec2.z; }
function vcross(vec1, vec2) { return vvec(
	vec1.y * vec2.z - vec1.z * vec2.y,
	vec1.z * vec2.x - vec1.x * vec2.z,
	vec1.x * vec2.y - vec1.y * vec2.x,
	vec1.w * vec2.w
); }

function mmat(
	m00, m01, m02, m03,
	m10, m11, m12, m13,
	m20, m21, m22, m23,
	m30, m31, m32, m33
) {
	return {
		m00: m00, m01: m01, m02: m02, m03: m03,
		m10: m10, m11: m11, m12: m12, m13: m13,
		m20: m20, m21: m21, m22: m22, m23: m23,
		m30: m30, m31: m31, m32: m32, m33: m33
	};
}
function mcopy(mat) {
	return mmat(
		mat.m00, mat.m01, mat.m02, mat.m03,
		mat.m10, mat.m11, mat.m12, mat.m13,
		mat.m20, mat.m21, mat.m22, mat.m23,
		mat.m30, mat.m31, mat.m32, mat.m33
	);
}
function mmcross(mat1, mat2) {
	return mmat(
		mat1.m00 * mat2.m00 + mat1.m01 * mat2.m10 + mat1.m02 * mat2.m20 + mat1.m03 * mat2.m30,
		mat1.m00 * mat2.m01 + mat1.m01 * mat2.m11 + mat1.m02 * mat2.m21 + mat1.m03 * mat2.m31,
		mat1.m00 * mat2.m02 + mat1.m01 * mat2.m12 + mat1.m02 * mat2.m22 + mat1.m03 * mat2.m32,
		mat1.m00 * mat2.m03 + mat1.m01 * mat2.m13 + mat1.m02 * mat2.m23 + mat1.m03 * mat2.m33,
		mat1.m10 * mat2.m00 + mat1.m11 * mat2.m10 + mat1.m12 * mat2.m20 + mat1.m13 * mat2.m30,
		mat1.m10 * mat2.m01 + mat1.m11 * mat2.m11 + mat1.m12 * mat2.m21 + mat1.m13 * mat2.m31,
		mat1.m10 * mat2.m02 + mat1.m11 * mat2.m12 + mat1.m12 * mat2.m22 + mat1.m13 * mat2.m32,
		mat1.m10 * mat2.m03 + mat1.m11 * mat2.m13 + mat1.m12 * mat2.m23 + mat1.m13 * mat2.m33,
		mat1.m20 * mat2.m00 + mat1.m21 * mat2.m10 + mat1.m22 * mat2.m20 + mat1.m23 * mat2.m30,
		mat1.m20 * mat2.m01 + mat1.m21 * mat2.m11 + mat1.m22 * mat2.m21 + mat1.m23 * mat2.m31,
		mat1.m20 * mat2.m02 + mat1.m21 * mat2.m12 + mat1.m22 * mat2.m22 + mat1.m23 * mat2.m32,
		mat1.m20 * mat2.m03 + mat1.m21 * mat2.m13 + mat1.m22 * mat2.m23 + mat1.m23 * mat2.m33,
		mat1.m30 * mat2.m00 + mat1.m31 * mat2.m10 + mat1.m32 * mat2.m20 + mat1.m33 * mat2.m30,
		mat1.m30 * mat2.m01 + mat1.m31 * mat2.m11 + mat1.m32 * mat2.m21 + mat1.m33 * mat2.m31,
		mat1.m30 * mat2.m02 + mat1.m31 * mat2.m12 + mat1.m32 * mat2.m22 + mat1.m33 * mat2.m32,
		mat1.m30 * mat2.m03 + mat1.m31 * mat2.m13 + mat1.m32 * mat2.m23 + mat1.m33 * mat2.m33
	);
}
function mvcross(mat, vec) {
	return mmat(
		mat.m00 * vec.x, mat.m01 * vec.y, mat.m02 * vec.z, mat.m03 * vec.w,
		mat.m10 * vec.x, mat.m11 * vec.y, mat.m12 * vec.z, mat.m13 * vec.w,
		mat.m20 * vec.x, mat.m21 * vec.y, mat.m22 * vec.z, mat.m23 * vec.w,
		mat.m30 * vec.x, mat.m31 * vec.y, mat.m32 * vec.z, mat.m33 * vec.w
	);
}

function world2screen(vec, projmodelview, w, h) {
	let v = mvcross(vec, projmodelview);
	v.x /= v.w;
	v.y /= v.w;
	v.z /= v.w;
	return v;
}

function screen2world(vec, proj, w, h) {
	p = vvec(0, 0, 0);
	p.x = (vec.x * 2 / w) - 1;
	p.y = (vec.y * 2 / h) - 1;
	p.z = vec.z;
	p.x = p.x * p.z / proj.m00;
	p.y = p.y * p.z / proj.m11;
	return p;
}

function deg2rad(deg) { return deg * (2 * Math.PI) / 360; }
function rad2deg(rad) { return rad * 360 / (2 * Math.PI); }