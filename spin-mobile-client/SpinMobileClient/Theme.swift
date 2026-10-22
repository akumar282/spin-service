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

struct MainSpinTheme: AppTheme {
    let mainColor: Color = Color(red: 253 / 255, green: 116 / 255, blue: 186 / 255)
    let secondaryColor: Color = Color(red: 253 / 255, green: 116 / 255, blue: 186 / 255)
    var font: Font = Font.custom("JetBrainsMono-Regular", size: 14)
    
}
