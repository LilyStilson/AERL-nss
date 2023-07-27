use std::convert::From;
use std::ops::{Add, Div};

#[derive(Debug, Copy, Clone, PartialEq, Eq, PartialOrd, Ord)]
pub struct U24(u32);

impl U24 {
    pub const MAX: u32 = 0xFFFFFF;

    pub fn from_be_bytes(bytes: [u8; 3]) -> Self {
        let value = (u32::from(bytes[0]) << 16) | (u32::from(bytes[1]) << 8) | u32::from(bytes[2]);
        U24(value)
    }
}

impl From<u32> for U24 {
    fn from(value: u32) -> Self {
        U24(value & U24::MAX)
    }
}

impl From<U24> for u32 {
    fn from(value: U24) -> Self {
        value.0
    }
}

impl Add for U24 {
    type Output = U24;

    fn add(self, rhs: U24) -> Self::Output {
        U24(self.0.wrapping_add(rhs.0) & U24::MAX)
    }
}

impl Add<u32> for U24 {
    type Output = U24;

    fn add(self, rhs: u32) -> Self::Output {
        U24(self.0.wrapping_add(rhs) & U24::MAX)
    }
}

impl Add<U24> for u32 {
    type Output = U24;

    fn add(self, rhs: U24) -> Self::Output {
        U24(self.wrapping_add(rhs.0) & U24::MAX)
    }
}

impl Div for U24 {
    type Output = U24;

    fn div(self, rhs: U24) -> Self::Output {
        U24(self.0 / rhs.0)
    }
}