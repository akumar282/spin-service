//
//  Theme.swift
//  spin-mobile-client
//
//  Created by Abhi on 10/22/26.
//

import SwiftUI

protocol AppTheme {
    var mainColor: Color { get }
    var secondaryColor: Color { get }
    var font: Font { get }
}

let Slate300 = Color(red: 226 / 255, green: 232 / 255, blue: 240 / 255)
let Orange300 = Color(red: 253 / 255, green: 186 / 255, blue: 116 / 255)
let Orange400 = Color(red: 255 / 255, green: 137 / 255, blue: 4 / 255)

struct MainSpinTheme: AppTheme {
    let mainColor: Color = Orange300
    let secondaryColor: Color = Orange400
    var font: Font = Font.custom("JetBrainsMono-Regular", size: 14)
    
}

struct DarkSpinTheme: AppTheme {
    let mainColor: Color = Color(red: 165 / 255, green: 180 / 255, blue: 252 / 255)
    let secondaryColor: Color = Color(red: 124 / 255, green: 134 / 255, blue: 255 / 255)
    var font: Font = Font.custom("JetBrainsMono-Regular", size: 14)
    
}


