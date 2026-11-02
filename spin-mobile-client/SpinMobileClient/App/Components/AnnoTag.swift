//
//  AnnoTag.swift
//  spin-mobile-client
//
//  Created by Abhi on 11/1/26.
//
import SwiftUI

struct AnnoTag: View {
    
    let tagText: String
    
    var body: some View {
        VStack {
            Text(tagText)
                .font(.custom("JetBrainsMono-Regular",size: 9))
                .padding(4)
        }
        .background(
            Orange300,
            in: RoundedRectangle(cornerRadius: 9)
        )
//        .overlay(RoundedRectangle(cornerRadius:8)
//            .stroke(Orange400, lineWidth: 1.5)
//        )
    }
}
