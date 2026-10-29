//
//  RecordCard.swift
//  spin-mobile-client
//
//  Created by Abhi on 10/27/26.
//

import SwiftUI

struct RecordCard: View {
    let artist: String
    let album: String
    let color: String
    let genre: [String]
    let storeLink: String
    var image: String?
    let preOrder: Bool
    let tag: String
    
    
    let testvar = "https://cdn.shopify.com/s/files/1/0271/7941/7698/files/CHARLIEBROWN-SQUARE.png?v=1793109871"
    
    var body: some View {
        VStack {
            HStack {
            }
            AsyncImage(url: URL(string: testvar)) {
                image in image
                    .image?.resizable()
                    .scaledToFit()
            }
                .frame(width: 140, height: 140)
            VStack(alignment: .leading, spacing: 3) {
                Text(album)
                    .fixedSize(horizontal: false, vertical: true)
                Text(artist)
                    .font(ThemeDefaults().italic)
                    .padding(.bottom, 5)
                Button(action: {}) {
                    Text("Get Notified")
                        .font(.custom("JetBrainsMono-Regular",size: 12))
                        .padding(5)
                        .frame(maxWidth: .infinity)
                }
                .background(
                    Orange300,
                    in: RoundedRectangle(cornerRadius: 8)
                )
                .overlay(RoundedRectangle(cornerRadius:8)
                    .stroke(Orange400, lineWidth: 1.5)
                )
            }
            .padding(.all, 7)
            
        }
        .overlay(RoundedRectangle(cornerRadius:8)
            .stroke(Orange400, lineWidth: 1.5)
        )
        .background(
            LinearGradient(colors: [Slate300, .white, Slate300], startPoint: .top, endPoint: .bottom),
            in: RoundedRectangle(cornerRadius: 8)
        )
        .frame(width: 170, height: 270)
        
    }
}
