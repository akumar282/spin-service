//
//  HomeNavButton.swift
//  spin-mobile-client
//
//  Created by Abhi on 11/2/26.
//
import SwiftUI

struct HomeNavButton<Destination: View>: View {
    let action: () -> Void
    let title: String
    let assetName: String
    @ViewBuilder let destination: () -> Destination
    
    var body: some View {
        NavigationLink {
            destination()
        } label: {
            VStack {
                HStack {
                    Text(title)
                        .padding(.leading, 3)
                    Spacer()
                    Image(assetName)
                        .resizable()
                        .scaledToFit()
                        .frame(width: 35, height: 35)
                        .padding(.trailing, 5)
                }
                .padding(.all, 10)
                .overlay(RoundedRectangle(cornerRadius:8)
                    .stroke(Orange400, lineWidth: 1.5)
                )
                .background(
                    LinearGradient(colors: [Slate300, .white, Slate300], startPoint: .top, endPoint: .bottom),
                    in: RoundedRectangle(cornerRadius: 8)
                )
                .shadow(radius: 2, y: 1)
                .padding([.bottom, .leading, .trailing], 7)
            }
        }
    }
}
