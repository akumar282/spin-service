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
    var image: String
//    let preOrder: Bool
    let releaseType: String?
    
    
    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            AnnoTag(tagText: releaseType?.capitalized ?? "New Release")
                .padding(6)
            
            AsyncImage(url: URL(string: image)) { phase in
                if let image = phase.image {
                    image
                        .resizable()
                        .scaledToFill()
                } else {
                    Image("shrug")
                        .resizable()
                        .scaledToFit()
                }
            }
            .frame(width: 120, height: 120)
            .clipped()
            .frame(maxWidth: .infinity)
            
            VStack(alignment: .leading, spacing: 3) {
                Text(album)
                    .font(.custom("JetBrainsMono-Regular", size: 15))
                    .fixedSize(horizontal: false, vertical: true)
                    .lineLimit(2)
                
                Text(artist)
                    .font(ThemeDefaults().italic)
                    .lineLimit(1)
            }
            .padding(.horizontal, 9)
            
            
            Spacer(minLength: 0)
            
            Button(action: {}) {
                Text("Get Notified")
                    .font(.custom("JetBrainsMono-Regular", size: 12))
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 5)
            }
            .background(
                Orange300,
                in: RoundedRectangle(cornerRadius: 9)
            )
            .overlay {
                RoundedRectangle(cornerRadius: 9)
                    .stroke(Orange400, lineWidth: 1.5)
            }
            .padding(.horizontal, 9)
            .padding(.bottom, 12)
        }
        .frame(width: 190, height: 276)
        .background {
            LinearGradient(
                colors: [Slate300, .white, Slate300],
                startPoint: .top,
                endPoint: .bottom
            )
        }
        .clipShape(RoundedRectangle(cornerRadius: 10))
        .overlay {
            RoundedRectangle(cornerRadius: 10)
                .stroke(Orange400, lineWidth: 1.5)
                .shadow(radius: 2, y: 1)
        }
        .padding(2)
    }
}
