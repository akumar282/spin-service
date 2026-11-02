//
//  UpcomingReleaseCard.swift
//  spin-mobile-client
//
//  Created by Abhi on 10/30/26.
//

//
//  RecordCard.swift
//  spin-mobile-client
//
//  Created by Abhi on 10/27/26.
//

import SwiftUI

struct UpcomingReleaseCard: View {
    let artist: String
    let album: String
    
    var body: some View {
        VStack(alignment: .leading) {
            VStack(alignment: .leading) {
                AnnoTag(tagText: "Upcoming")
            }
            .padding(6)
            
            VStack(alignment: .leading, spacing: 3) {
                Text(album)
                    .fixedSize(horizontal: false, vertical: true)
                Text(artist)
                    .font(ThemeDefaults().italic)
                    .padding(.bottom, 5)
                Spacer()
                Text("30 October 2026")
                    .font(ThemeDefaults().italic)
                    .padding(.bottom, 5)
            }
            .padding(.all, 5.5)
            
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
        .overlay(RoundedRectangle(cornerRadius:9)
            .stroke(Orange400, lineWidth: 1.5)
        )
        .background(
            LinearGradient(colors: [Slate300, .white, Slate300], startPoint: .top, endPoint: .bottom),
            in: RoundedRectangle(cornerRadius: 9)
        )
        
    }
}
