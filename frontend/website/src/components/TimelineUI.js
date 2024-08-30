import React, { useRef, useEffect } from 'react';
import Paper from '@mui/material/Paper';
import * as d3 from 'd3';

const TimelineUI = () => {
  const ref = useRef();

  useEffect(() => {
    // Sample data
    const data = [
      { date: new Date(2000, 1, 1), event: 'Event 1', value: 10 },
      { date: new Date(2020, 3, 1), event: 'Event 2', value: 20 },
      { date: new Date(2020, 6, 1), event: 'Event 3', value: 15 },
      { date: new Date(2020, 9, 1), event: 'Event 4', value: 25 },
    ];

    // Define viewBox dimensions
    const viewbox_width = 1900;
    const viewbox_height = 800;
    const width=1900;
    const height=800;
    let scale_width = 800;
    let scale_height = 50;

    // Add attributes to ref.current
    const svg = d3.select(ref.current) // selecting the ref element to edit
      .attr('viewBox', [0, 0, viewbox_width, viewbox_height])
      .attr('width', width)  // width of the svg element
      .attr('height', height)  // height of the svg element
      .attr("style", "max-width: 100%; height: auto;"); // inline css style

    // Clear any existing content
    svg.selectAll('*').remove();

    // Create a group element and center it
    // set attributes for the group element, allow translation of the group element
    const g = svg.append('g')
      .attr('transform', `translate(${(viewbox_width - scale_width) / 2}, ${(viewbox_height - scale_height) / 2})`); // move the entire group element to the center of the svg element

    // Create the time scale
    const x = d3.scaleTime()
      .domain(d3.extent(data, d => d.date)) // min and max values of the data
      .range([0, scale_width]); // min and max pixel position

    // Create the vertical scale
    const y = d3.scaleLinear()
      .domain([0, scale_height]) // min and max values of the data  
      .range([scale_height, 0]);  // min and max pixel position

    // Create the x axis
    const xAxis = g.append('g') // add another g elemet to the group element
      .attr('transform', `translate(0, ${scale_height})`) // move the x axis to the bottom of the svg element
      .call(d3.axisBottom(x)); // call means apply function to a selection   axisBottom create a axis at the bottom


    // Create the y axis
    const yAxis = g.append('g') // add another g elemet to the group element
      .call(d3.axisLeft(y)); // call means apply function to a selection   axisLeft create a axis at the left

    // Create the zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([1, 700]) // min and max zoom level
      .translateExtent([[0, 0], [viewbox_width, viewbox_height]])  // set the extent of the translation
      .extent([[0, 0], [viewbox_width, viewbox_height]]) // set the extent of the zoom
      .on('zoom', zoomed); // trigger the zoomed function when zoom event is triggered

    // Add a rect for capturing zoom and pan events
    svg.append('rect')
      .attr('width', viewbox_width)
      .attr('height', viewbox_height)
      .style('fill', 'none')  // invisible fill
      .style('pointer-events', 'all') // The rectangle will capture all mouse events. This is essential for capturing zoom and pan interactions.
      .call(zoom); //apply the zoom behavior to the rectangle, enable the rect to capture zoom and pan events

    // Append circles to represent events
    const circles = g.selectAll('circle') // even tho there are no circles, it will select all circles for data binding(future use)
      .data(data) // Binds the provided data to the selected circle elements.
      .enter().append('circle') //appending a new circle element for each datum that does not have a corresponding DOM element
      .attr('cx', d => x(d.date)) // cx is the horizontal position of the circle
      .attr('cy', d => y(scale_height/2))
      .attr('r', 5);

    // Define the zoomed function
    function zoomed(event) {
      const { transform } = event;  //extract the transform object from the event

      scale_height = 50 * transform.k;
      scale_width = 800 * transform.k;

      const verticalScaleFactor = 0.1;
      const adjustedTransform = d3.zoomIdentity
        .translate(transform.x, transform.y * verticalScaleFactor)
        .scale(transform.k);

      const newX = adjustedTransform.rescaleX(x.domain(d3.extent(data, d => d.date)).range([0, scale_width]));
      const newY = adjustedTransform.rescaleY(y.domain([0, d3.max(data, d => d.value)]).range([scale_height,0]));
      
      xAxis.call(d3.axisBottom(newX));
      yAxis.call(d3.axisLeft(newY));
      
      circles
        .attr('cx', d => newX(d.date))
        .attr('cy', scale_height / 2);
    }
  }, []);

  return (
    <Paper elevation={3} style={{ height: '90%', width: '100%', padding: '20px', margin: '0px' }}>
      <svg ref={ref}></svg>
    </Paper>
  );
};

export default TimelineUI;