"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { DashboardData } from "@/lib/dashboard-data";
import { Panel, PanelHeading } from "./dashboard-primitives";

const branch = { latitude: 14.777196, longitude: 121.051155 };

type BuyerOrder = DashboardData["sales"]["customers"][number];

function getCoordinates(latitudeValue: unknown, longitudeValue: unknown) {
  const latitude =
    typeof latitudeValue === "number"
      ? latitudeValue
      : typeof latitudeValue === "string" && latitudeValue.trim()
        ? Number(latitudeValue)
        : NaN;
  const longitude =
    typeof longitudeValue === "number"
      ? longitudeValue
      : typeof longitudeValue === "string" && longitudeValue.trim()
        ? Number(longitudeValue)
        : NaN;

  return Number.isFinite(latitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    Number.isFinite(longitude) &&
    longitude >= -180 &&
    longitude <= 180
    ? { latitude, longitude }
    : null;
}

export function BuyerMap({ orders }: { orders: BuyerOrder[] }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const activeOrders = orders.filter(
    (order) =>
      order.deliveryStatus !== "delivered" &&
      order.deliveryStatus !== "cancelled" &&
      getCoordinates(order.latitude, order.longitude) !== null,
  );
  const buyerCount = new Set(activeOrders.map((order) => order.email)).size;
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    if (!mapContainer.current || !token || map.current) return;

    mapboxgl.accessToken = token;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [branch.longitude, branch.latitude],
      zoom: 10,
    });
    const navigationControl = new mapboxgl.NavigationControl();
    map.current.addControl(navigationControl, "top-right");
    const controlLabels: Record<string, string> = {
      "mapboxgl-ctrl-zoom-in": "Zoom in",
      "mapboxgl-ctrl-zoom-out": "Zoom out",
      "mapboxgl-ctrl-compass": "Reset north",
    };
    Object.entries(controlLabels).forEach(([className, label]) => {
      const control = map.current?.getContainer().querySelector(`.${className}`);
      if (control instanceof HTMLButtonElement) {
        control.title = label;
        control.setAttribute("aria-label", label);
      }
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [token]);

  useEffect(() => {
    if (!map.current) return;
    const markers: mapboxgl.Marker[] = [];
    const bounds = new mapboxgl.LngLatBounds([branch.longitude, branch.latitude], [branch.longitude, branch.latitude]);

    const branchPopup = new mapboxgl.Popup({ closeButton: false, closeOnClick: false })
      .setLngLat([branch.longitude, branch.latitude])
      .setText("Bawat Pieza branch");
    const branchMarker = new mapboxgl.Marker({ color: "#ff9a4d" })
      .setLngLat([branch.longitude, branch.latitude])
      .setPopup(branchPopup)
      .addTo(map.current);
    branchMarker.getElement().addEventListener("mouseenter", () => branchPopup.addTo(map.current!));
    branchMarker.getElement().addEventListener("mouseleave", () => branchPopup.remove());

    activeOrders.forEach((order) => {
      const coordinates = getCoordinates(order.latitude, order.longitude);
      if (!coordinates) return;
      const marker = new mapboxgl.Marker({ color: "#72c7ed" })
        .setLngLat([coordinates.longitude, coordinates.latitude])
        .addTo(map.current!);
      const popupContent = document.createElement("div");
      popupContent.className = "buyer-map-popup";
      const name = document.createElement("strong");
      name.className = "buyer-map-popup__name";
      name.textContent = order.name;
      const address = document.createElement("p");
      address.className = "buyer-map-popup__text";
      address.textContent = `${order.address}, ${order.city}`;
      const distance = document.createElement("p");
      distance.className = "buyer-map-popup__text";
      distance.textContent =
        typeof order.distanceKm !== "number" || !Number.isFinite(order.distanceKm)
          ? "Distance unavailable"
          : `${order.distanceKm.toFixed(2)} km from branch`;
      const source = document.createElement("p");
      source.className = "buyer-map-popup__text";
      source.textContent = order.locationSource === "device"
        ? `Device GPS${typeof order.locationAccuracyMeters === "number" ? ` (±${Math.round(order.locationAccuracyMeters)} m)` : ""}`
        : "Address geocoded";
      popupContent.append(name, address, distance, source);
      const popup = new mapboxgl.Popup({ closeButton: false, closeOnClick: false })
        .setLngLat([coordinates.longitude, coordinates.latitude])
        .setDOMContent(popupContent);
      marker.setPopup(popup);
      marker.getElement().addEventListener("mouseenter", () => popup.addTo(map.current!));
      marker.getElement().addEventListener("mouseleave", () => popup.remove());
      markers.push(marker);
      bounds.extend([coordinates.longitude, coordinates.latitude]);
    });

    if (activeOrders.length > 0) {
      map.current.fitBounds(bounds, { padding: 60, maxZoom: 13 });
    }

    return () => {
      branchMarker.remove();
      markers.forEach((marker) => marker.remove());
    };
  }, [activeOrders]);

  return (
    <Panel>
      <PanelHeading
        title="Buyer delivery map"
        description="Active orders and their distance from the branch."
        action={`${buyerCount} buyer${buyerCount === 1 ? "" : "s"}`}
      />
      {!token ? (
        <p className="text-sm text-[#ff8585]">Mapbox is not configured for this dashboard.</p>
      ) : (
        <div className="relative">
          <div className="h-[420px] overflow-hidden rounded-xl border border-[#292929]" ref={mapContainer} />
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-[#999]">
            <span>● Orange: branch</span>
            <span>● Blue: active buyers</span>
            <span>{activeOrders.length} mapped active order{activeOrders.length === 1 ? "" : "s"}</span>
          </div>
        </div>
      )}
    </Panel>
  );
}
